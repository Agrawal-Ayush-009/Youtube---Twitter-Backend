import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  const { content } = req.body;

  console.log("OWNER", user);

  if (!content) {
    throw new ApiError(400, "All fields are required");
  }

  const tweet = await Tweet.create({
    content: content,
    owner: user,
  });

  const createdTweet = await Tweet.findById(tweet._id);

  if (!createdTweet) {
    throw new ApiError(500, "Error while creating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdTweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  console.log("TWEETS", tweets);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"));
});

const updateTweets = asyncHandler(async (req, res) => {
  const { _id, content } = req.body;

  if (!_id || !content) {
    throw new ApiError(400, "All fields are required");
  }

  const isAvailable = await Tweet.findById(_id);
  if (!isAvailable) {
    throw new ApiError(400, "tweet is not available");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    _id,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    throw new ApiError(400, "id is necessary");
  }

  const isAvailable = await Tweet.findById(_id);
  if (!isAvailable) {
    throw new ApiError(400, "tweet is not available");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(_id);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweets, deleteTweet };
