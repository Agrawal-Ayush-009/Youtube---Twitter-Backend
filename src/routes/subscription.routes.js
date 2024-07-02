import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getSubscribedChannel,
  getUserChannelSubscriber,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);
// router.route("/subscribe-channel").post(subscribeChannel);
router
  .route("/channel/:channelId")
  .post(toggleSubscription)
  .get(getUserChannelSubscriber);

router.route("/user/:subscriberId").get(getSubscribedChannel);

export default router;
