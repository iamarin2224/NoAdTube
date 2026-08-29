import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.js";
import { sendOTPEmail } from "../utils/mailer.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

// Helper function to generate tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Error in generating access and refresh token", error);
    }
};

const getAccessCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    };
};

const getRefreshCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    };
};

const getClearCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    };
};

// Register user route with 6-digit OTP generation & email sending
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    if ([fullname, username, email, password].some((fields) => fields?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    // Check if verified user exists
    const existingUser = await User.findOne({
        $or: [{ username: cleanUsername }, { email: cleanEmail }]
    });

    if (existingUser && existingUser.isVerified) {
        throw new ApiError(409, "User with given username or email already exists");
    }

    // Handle avatar: generate letter avatar based on username initial if none provided
    const userInitial = cleanUsername.charAt(0).toUpperCase() || 'U';
    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInitial)}&background=cc0000&color=ffffff&bold=true&size=256`;

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (avatarLocalPath) {
        try {
            const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
            if (uploadedAvatar) avatarUrl = uploadedAvatar.secure_url;
        } catch (error) {
            console.log("Error in uploading avatar:", error);
        }
    }

    // Handle cover image
    let coverImageUrl = "";
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (coverImageLocalPath) {
        try {
            const uploadedCover = await uploadOnCloudinary(coverImageLocalPath);
            if (uploadedCover) coverImageUrl = uploadedCover.secure_url;
        } catch (error) {
            console.log("Error in uploading coverImage:", error);
        }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    if (existingUser && !existingUser.isVerified) {
        // Update existing unverified user
        existingUser.fullname = fullname.trim();
        existingUser.username = cleanUsername;
        existingUser.password = password;
        existingUser.avatar = avatarUrl;
        if (coverImageUrl) existingUser.coverImage = coverImageUrl;
        existingUser.emailVerificationOTP = otp;
        existingUser.emailVerificationExpires = otpExpiry;
        user = await existingUser.save();
    } else {
        user = await User.create({
            fullname: fullname.trim(),
            username: cleanUsername,
            email: cleanEmail,
            password,
            avatar: avatarUrl,
            coverImage: coverImageUrl,
            isVerified: false,
            emailVerificationOTP: otp,
            emailVerificationExpires: otpExpiry
        });
    }

    // Send OTP verification email
    try {
        await sendOTPEmail(cleanEmail, otp, fullname.trim());
    } catch (mailError) {
        console.error("Failed to send OTP email:", mailError);
        // We do not abort registration if email service hits error, but log it
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { email: user.email, isVerified: false },
            "Registration initiated. Please enter the 6-digit OTP sent to your email."
        )
    );
});

// Verify OTP route
const verifyEmailOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and 6-digit OTP are required");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    if (user.isVerified) {
        return res.status(200).json(
            new ApiResponse(200, { isVerified: true }, "Account is already verified. Please sign in.")
        );
    }

    if (!user.emailVerificationOTP || user.emailVerificationOTP !== cleanOtp) {
        throw new ApiError(400, "Invalid verification code. Please check and try again.");
    }

    if (new Date() > new Date(user.emailVerificationExpires)) {
        throw new ApiError(400, "Verification code has expired. Please request a new code.");
    }

    // Activate account
    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Generate tokens & set cookies
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationOTP -emailVerificationExpires");

    return res
        .status(200)
        .cookie("accessToken", accessToken, getAccessCookieOptions())
        .cookie("refreshToken", refreshToken, getRefreshCookieOptions())
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "Email verified successfully. Welcome to NoAdTube!"
            )
        );
});

// Resend OTP route
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email address is required");
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
        throw new ApiError(404, "No account found with this email address");
    }

    if (user.isVerified) {
        throw new ApiError(400, "This account is already verified. Please log in.");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationOTP = otp;
    user.emailVerificationExpires = otpExpiry;
    await user.save({ validateBeforeSave: false });

    try {
        await sendOTPEmail(cleanEmail, otp, user.fullname || "Creator");
    } catch (mailError) {
        console.error("Resend OTP mailer notice:", mailError.message);
    }

    return res.status(200).json(
        new ApiResponse(200, { email: cleanEmail }, "A fresh 6-digit verification code has been sent to your email.")
    );
});

// Google OAuth integration (Better Auth & Google Social Sign-In)
const googleAuth = asyncHandler(async (req, res) => {
    const { credential, idToken, code, userInfo } = req.body;

    let googleData = null;

    if (credential || idToken) {
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential || idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            googleData = ticket.getPayload();
        } catch (verifyError) {
            console.error("Google token verification failed:", verifyError);
            throw new ApiError(401, "Invalid Google credentials. Authentication failed.");
        }
    } else if (userInfo && userInfo.email) {
        googleData = userInfo;
    } else {
        throw new ApiError(400, "Google authentication credential is required");
    }

    const { email, name, picture, sub: googleId } = googleData;
    if (!email) {
        throw new ApiError(400, "Email is required from Google account");
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists by email or googleId
    let user = await User.findOne({
        $or: [{ email: cleanEmail }, { googleId: googleId || "" }]
    });

    if (user) {
        if (!user.googleId && googleId) {
            user.googleId = googleId;
        }
        if (!user.isVerified) {
            user.isVerified = true;
            user.emailVerificationOTP = undefined;
            user.emailVerificationExpires = undefined;
        }
        if (picture) {
            user.avatar = picture;
        } else if (!user.avatar || user.avatar.includes("default") || user.avatar.includes("gros0w3uearv5pqturij")) {
            const userInitial = (user.username || user.fullname || name || "U").charAt(0).toUpperCase();
            user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInitial)}&background=cc0000&color=ffffff&bold=true&size=256`;
        }
        await user.save({ validateBeforeSave: false });
    } else {
        // Create new user for Google sign in
        const baseUsername = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        let uniqueUsername = baseUsername || "user";
        
        const existingUsername = await User.findOne({ username: uniqueUsername });
        if (existingUsername) {
            uniqueUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const userInitial = (uniqueUsername || name || 'U').charAt(0).toUpperCase();
        const defaultGoogleAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInitial)}&background=cc0000&color=ffffff&bold=true&size=256`;

        user = await User.create({
            fullname: name || uniqueUsername,
            username: uniqueUsername,
            email: cleanEmail,
            avatar: picture || defaultGoogleAvatar,
            googleId: googleId || crypto.randomUUID(),
            isVerified: true,
            password: crypto.randomBytes(32).toString("hex")
        });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationOTP -emailVerificationExpires");

    return res
        .status(200)
        .cookie("accessToken", accessToken, getAccessCookieOptions())
        .cookie("refreshToken", refreshToken, getRefreshCookieOptions())
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "Google authentication successful"
            )
        );
});

// Login user route
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(username || email) || !password) {
        throw new ApiError(400, "Username/email and password are required");
    }

    const user = await User.findOne({
        $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }]
    });

    if (!user) {
        throw new ApiError(404, "User not found with provided credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // If user is not verified, trigger OTP resend and prompt verification
    if (!user.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationOTP = otp;
        user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        try {
            await sendOTPEmail(user.email, otp, user.fullname || "Creator");
        } catch (err) {
            console.error("Failed to send OTP on login:", err);
        }

        return res.status(403).json(
            new ApiResponse(
                403,
                { isVerified: false, email: user.email },
                "Please verify your email before logging in. A new 6-digit OTP has been sent."
            )
        );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationOTP -emailVerificationExpires");

    return res
        .status(200)
        .cookie("accessToken", accessToken, getAccessCookieOptions())
        .cookie("refreshToken", refreshToken, getRefreshCookieOptions())
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    if (req.user?._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            { new: true }
        );
    }

    const clearOptions = getClearCookieOptions();

    return res
        .status(200)
        .clearCookie("accessToken", clearOptions)
        .clearCookie("refreshToken", clearOptions)
        .json(new ApiResponse(200, {}, "Successfully logged out the user"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token not found");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, getAccessCookieOptions())
            .cookie("refreshToken", newRefreshToken, getRefreshCookieOptions())
            .json(new ApiResponse(200, { accessToken, newRefreshToken }, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect current password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getUserDetails = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User data fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    if (!fullname || !email) {
        throw new ApiError(400, "Fullname and email are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email.toLowerCase()
            }
        },
        { new: true }
    ).select("-password -refreshToken -emailVerificationOTP -emailVerificationExpires");

    return res.status(200).json(new ApiResponse(200, user, "User data updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Something went wrong while uploading avatar");
    }

    const prevAvatar = (await User.findById(req.user?._id))?.avatar;
    if (prevAvatar) {
        const publicId = extractPublicId(prevAvatar);
        if (publicId) await deleteFromCloudinary(publicId).catch(() => {});
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.secure_url
            }
        },
        { new: true }
    ).select("-password -refreshToken -emailVerificationOTP -emailVerificationExpires");

    return res.status(200).json(new ApiResponse(200, user, "User avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage) {
        throw new ApiError(500, "Something went wrong while uploading cover image");
    }

    const prevCover = (await User.findById(req.user?._id))?.coverImage;
    if (prevCover) {
        const publicId = extractPublicId(prevCover);
        if (publicId) await deleteFromCloudinary(publicId).catch(() => {});
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.secure_url
            }
        },
        { new: true }
    ).select("-password -refreshToken -emailVerificationOTP -emailVerificationExpires");

    return res.status(200).json(new ApiResponse(200, user, "User cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriptionList"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscribedChannelsCount: { $size: "$subscriptionList" },
                isSubsribed: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?._id,
                                {
                                    $map: {
                                        input: "$subscribers",
                                        as: "subsArray",
                                        in: "$$subsArray.subscriber"
                                    }
                                }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedChannelsCount: 1,
                isSubsribed: 1,
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const userDoc = await User.findById(req.user?._id).select("watchHistory");
    if (!userDoc) {
        throw new ApiError(404, "User not found");
    }

    const historyIds = (userDoc.watchHistory || []).map((id) => id?.toString()).filter(Boolean);

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                        coverImage: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    const rawVideos = user[0]?.watchHistory || [];

    // Map videos by string ID for O(1) retrieval
    const videoMap = new Map();
    rawVideos.forEach((v) => {
        if (v?._id) {
            videoMap.set(v._id.toString(), v);
        }
    });

    // Reconstruct in exact reverse-chronological click order (latest clicked video first)
    const sortedHistory = [];
    for (let i = historyIds.length - 1; i >= 0; i--) {
        const idStr = historyIds[i];
        const vid = videoMap.get(idStr);
        if (vid) {
            sortedHistory.push(vid);
            videoMap.delete(idStr); // Prevent duplicates
        }
    }

    return res.status(200).json(new ApiResponse(200, sortedHistory, "Watch history fetched successfully"));
});

export {
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
};