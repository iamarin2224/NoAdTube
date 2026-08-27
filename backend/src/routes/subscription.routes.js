import { Router } from "express";

import { 
    subscribeToChannel,
    unsubscribeChannel,
    getSubscribedChannels,
    toggleSubscription
} from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router();

router.route("/channels").get(verifyJWT, getSubscribedChannels);

router.route("/toggle/:username").post(verifyJWT, toggleSubscription);

router.route("/subscribe/:username").post(verifyJWT, subscribeToChannel);

router.route("/unsubscribe/:username").delete(verifyJWT, unsubscribeChannel);

export default router;