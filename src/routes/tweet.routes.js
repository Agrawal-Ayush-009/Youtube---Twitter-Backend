import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweets,
} from "../controllers/tweet.controller.js";

const router = Router();

router.route("/post-tweet").post(verifyJWT, createTweet);
router.route("/get-tweets").get(verifyJWT, getUserTweets);
router.route("/update-tweet").patch(verifyJWT, updateTweets);
router.route("/delete-tweet").delete(verifyJWT, deleteTweet);
export default router;
