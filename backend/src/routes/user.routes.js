import { Router } from "express";

import { 
    registerUser, 
    verifyEmailOTP,
    resendOTP,
    googleAuth,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getUserDetails,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory 
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, optionalAuth } from "../middlewares/auth.middlware.js";

const router = Router();

// Unsecured / Auth routes
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/verify-otp").post(verifyEmailOTP);

router.route("/resend-otp").post(resendOTP);

router.route("/google-auth").post(googleAuth);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/channel/:username").get(optionalAuth, getUserChannelProfile);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/change-password").post(verifyJWT, changePassword);

router.route("/user-details").get(verifyJWT, getUserDetails);

router.route("/update/account-details").patch(verifyJWT, updateAccountDetails);

router.route("/update/avatar").post(verifyJWT, upload.single("avatar"), updateAvatar);

router.route("/update/cover-image").post(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;