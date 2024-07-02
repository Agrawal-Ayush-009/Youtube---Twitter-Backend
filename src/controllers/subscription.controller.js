import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subsription.model.js";

const subscribeChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.body;
  const user = await User.findById(req.user?._id);

  if (!channelId) {
    throw new ApiError(400, "All fields are required.");
  }

  const channel = await User.findById(channelId);

  const subscription = await Subscription.create({
    channel: channel,
    subscriber: user,
  });

  const createdSubscription = await Subscription.findById(subscription._id);

  console.log("SUBSCRIPTION", createdSubscription);

  return res
    .status(201)
    .json(new ApiResponse(200, createdSubscription, "subscribed successfully"));
});

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const user = await User.findById(req.user?._id);

  if (!channelId) {
    throw new ApiError(400, "All fields are required");
  }

  const subscribed = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
  ]);

  let isSubscribed = false;
  let subscriptionId;

  for (let index = 0; index < subscribed.length; index++) {
    const { channel } = subscribed[index];
    const { _id } = subscribed[index];
    if (channel._id == channelId) {
      subscriptionId = _id;
      isSubscribed = true;
      break;
    }
  }

  if (!isSubscribed) {
    const channel = await User.findById(channelId);

    const subscription = await Subscription.create({
      channel: channel,
      subscriber: user,
    });

    const createdSubscription = await Subscription.findById(subscription._id);

    console.log("SUBSCRIPTION", createdSubscription);

    return res
      .status(201)
      .json(
        new ApiResponse(200, createdSubscription, "subscribed successfully")
      );
  }

  const unsubscribed = await Subscription.findByIdAndDelete(subscriptionId);

  console.log("subscribed", subscribed);

  return res
    .status(200)
    .json(new ApiResponse(200, unsubscribed, "unsubscribed successful"));
});

const getUserChannelSubscriber = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "All fields are required");
  }

  const subscriber = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $addFields: {
        subscriber: {
          $first: "$subscriber",
        },
      },
    },
    {
      $project: {
        subscriber: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, subscriber, "subscriber fetched successfully"));
});

const getSubscribedChannel = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "All fields are required");
  }

  const subscribedChannel = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $addFields: {
        channel: {
          $first: "$channel",
        },
      },
    },
    {
      $project: {
        channel: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribedChannel, "success"));
});

export {
  subscribeChannel,
  toggleSubscription,
  getUserChannelSubscriber,
  getSubscribedChannel,
};
