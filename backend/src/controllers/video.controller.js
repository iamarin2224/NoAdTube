import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import { Video } from "../models/videos.models.js";
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId, deleteVideoFromCloudinary } from "../utils/cloudinary.js";
import { Subscription } from "../models/subscriptions.models.js";
import mongoose from "mongoose";
import fs from "fs";

// Maximum 1 GB (1,073,741,824 bytes) video storage per standard account
const MAX_ACCOUNT_STORAGE_BYTES = 1024 * 1024 * 1024;

// Storage exception & Admin check helper
const isUnlimitedStorageUser = (user) => {
    if (!user) return false;
    const email = user.email?.toLowerCase() || "";
    const username = user.username?.toLowerCase() || "";
    return (
        email === "iamarindas@gmail.com" ||
        username === "iamarindas" ||
        email === "noadtube.online@gmail.com"
    );
};

const isAdminUser = (user) => {
    if (!user) return false;
    return user.email?.toLowerCase() === "noadtube.online@gmail.com";
};

// Upload video with 1 GB account storage quota enforcement (with unlimited exceptions)
const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description, tags } = req.body;
    if (!(title && description)) {
        throw new ApiError(400, "Title and Description are required");
    }

    const videoFilePath = req.files?.videoFile?.[0]?.path;
    const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;
    if (!(videoFilePath && thumbnailFilePath)) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const userID = req.user?._id;
    if (!userID) {
        throw new ApiError(404, "User ID not found. Please ensure you are logged in!");
    }
    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(404, "User not found in database");
    }

    // Determine incoming video file size in bytes
    let incomingSize = req.files?.videoFile?.[0]?.size || 0;
    if (!incomingSize && videoFilePath) {
        try {
            const stats = fs.statSync(videoFilePath);
            incomingSize = stats.size;
        } catch (e) {}
    }

    // Check account-level storage limit (bypass if unlimited storage user / admin)
    const isUnlimited = isUnlimitedStorageUser(user);
    if (!isUnlimited) {
        const storageAgg = await Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(user._id) } },
            { $group: { _id: null, totalBytes: { $sum: "$size" } } }
        ]);
        const currentUsedBytes = storageAgg[0]?.totalBytes || 0;

        if (currentUsedBytes + incomingSize > MAX_ACCOUNT_STORAGE_BYTES) {
            const usedMB = (currentUsedBytes / (1024 * 1024)).toFixed(1);
            const incomingMB = (incomingSize / (1024 * 1024)).toFixed(1);
            const remainingMB = Math.max(0, (MAX_ACCOUNT_STORAGE_BYTES - currentUsedBytes) / (1024 * 1024)).toFixed(1);

            // Delete temporary local files
            try {
                if (fs.existsSync(videoFilePath)) fs.unlinkSync(videoFilePath);
                if (fs.existsSync(thumbnailFilePath)) fs.unlinkSync(thumbnailFilePath);
            } catch (e) {}

            throw new ApiError(
                400,
                `Account storage limit reached! You have used ${usedMB} MB / 1024 MB (1 GB). This upload (${incomingMB} MB) exceeds your remaining ${remainingMB} MB.`
            );
        }
    }

    let parsedTags = [];
    if (tags) {
        if (Array.isArray(tags)) {
            parsedTags = tags.map((t) => t.trim()).filter(Boolean);
        } else if (typeof tags === "string") {
            parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
        }
    }

    let videoFile;
    try {
        videoFile = await uploadOnCloudinary(videoFilePath);
    } catch (error) {
        console.log("Error in uploading video", error);
        throw new ApiError(500, "Failed to upload video");
    }

    let thumbnail;
    try {
        thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    } catch (error) {
        console.log("Error in uploading thumbnail", error);
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    let video;
    try {
        video = await Video.create({
            videoFile: videoFile.secure_url,
            thumbnail: thumbnail.secure_url,
            title: title.trim(),
            description: description.trim(),
            tags: parsedTags,
            duration: videoFile.duration || 0,
            size: incomingSize,
            owner: user._id
        });

        const uploadedVideo = await Video.findById(video._id);
        return res.status(201).json(new ApiResponse(201, uploadedVideo, "Video was successfully uploaded"));
    } catch (error) {
        console.log("Video uploading failed: ", error);
        if (video?._id) {
            await Video.findByIdAndDelete(video._id);
        }
        if (videoFile) {
            await deleteVideoFromCloudinary(videoFile.public_id);
        }
        if (thumbnail) {
            await deleteFromCloudinary(thumbnail.public_id);
        }
        throw new ApiError(500, "Something went wrong while uploading the video. Uploaded data and files were deleted");
    }
});

const viewVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const userID = req.user?._id;
    if (!userID) {
        throw new ApiError(404, "User Id not found. Please log in to view");
    }

    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(404, "User not found in database");
    }

    // Always promote the latest clicked/watched video to the end of history
    user.watchHistory = (user.watchHistory || []).filter(
        (id) => id && id.toString() !== videoId.toString()
    );
    user.watchHistory.push(videoId);
    await user.save({ validateBeforeSave: false });

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 }
        },
        { new: true }
    ).populate("owner", "username avatar fullname");

    if (!video) {
        throw new ApiError(404, "Video not found in database");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video view count updated successfully"));
});

const getVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(404, "Video Id not found");
    }

    const video = await Video.findById(videoId).populate("owner", "username fullname avatar");
    if (!video) {
        throw new ApiError(404, "Video does not exist in database");
    }

    let subscribersCount = 0;
    let isSubscribed = false;

    if (video.owner?._id) {
        subscribersCount = await Subscription.countDocuments({ channel: video.owner._id });
        if (req.user?._id) {
            const sub = await Subscription.findOne({
                subscriber: req.user._id,
                channel: video.owner._id
            });
            isSubscribed = !!sub;
        }
    }

    const videoData = video.toObject();
    if (videoData.owner) {
        videoData.owner.subscribersCount = subscribersCount;
        videoData.owner.isSubscribed = isSubscribed;
    }

    return res.status(200).json(new ApiResponse(200, videoData, "Video details fetched successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, query, tag, sortBy = "createdAt", sortType = "desc", userId, subscribed } = req.query;

    const pipeline = [];

    // Filter by subscribed channels if requested
    if (subscribed === "true" && req.user?._id) {
        const subscriptions = await Subscription.find({ subscriber: req.user._id }).select("channel");
        const channelIds = subscriptions.map((sub) => sub.channel);
        pipeline.push({
            $match: {
                owner: { $in: channelIds }
            }
        });
    }

    // Filter by specific user if provided
    if (userId) {
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // Filter by tag if requested and not "All"
    if (tag && tag !== "All" && tag.trim() !== "") {
        const tagRegex = new RegExp(`^${tag.trim()}$`, "i");
        pipeline.push({
            $match: {
                tags: { $in: [tagRegex] }
            }
        });
    }

    // Lookup owner details
    pipeline.push({
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
                        avatar: 1
                    }
                }
            ]
        }
    });

    pipeline.push({
        $addFields: {
            owner: { $first: "$owner" }
        }
    });

    // Search query matching video title, description, author name/username, or tags
    if (query && query.trim() !== "") {
        const searchRegex = new RegExp(query.trim(), "i");
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } },
                    { "owner.username": { $regex: searchRegex } },
                    { "owner.fullname": { $regex: searchRegex } },
                    { tags: { $in: [searchRegex] } }
                ]
            }
        });
    }

    // Sorting
    const sortOrder = sortType === "asc" ? 1 : -1;
    pipeline.push({
        $sort: {
            [sortBy]: sortOrder
        }
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const videos = await Video.aggregate(pipeline);

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const getAllTags = asyncHandler(async (req, res) => {
    const rawTagsFromDB = await Video.distinct("tags");
    const validTags = rawTagsFromDB
        .filter((t) => t && typeof t === "string" && t.trim() !== "")
        .map((t) => t.trim());

    // Core navigation tabs
    const coreTabs = ["All", "Subscribed", "Trending"];
    const uniqueDynamicTags = Array.from(new Set(validTags)).filter(
        (t) => !coreTabs.includes(t)
    );

    const merged = [...coreTabs, ...uniqueDynamicTags];
    return res.status(200).json(new ApiResponse(200, merged, "Tags fetched successfully"));
});

const getStorageUsage = asyncHandler(async (req, res) => {
    const userID = req.user?._id;
    if (!userID) {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(userID);
    const isUnlimited = isUnlimitedStorageUser(user);

    const storageAgg = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userID) } },
        { $group: { _id: null, totalBytes: { $sum: "$size" } } }
    ]);

    const usedBytes = storageAgg[0]?.totalBytes || 0;
    const maxBytes = isUnlimited ? Infinity : MAX_ACCOUNT_STORAGE_BYTES;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                usedBytes,
                maxBytes: isUnlimited ? null : maxBytes,
                usedMB: (usedBytes / (1024 * 1024)).toFixed(1),
                maxMB: isUnlimited ? "Unlimited" : 1024,
                remainingMB: isUnlimited ? "Unlimited" : Math.max(0, (maxBytes - usedBytes) / (1024 * 1024)).toFixed(1),
                percentage: isUnlimited ? 0 : Math.min(100, (usedBytes / maxBytes) * 100).toFixed(1),
                isUnlimited,
                isAdmin: isAdminUser(user)
            },
            "Storage usage fetched successfully"
        )
    );
});

// Admin Panel Statistics
const getAdminStats = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!isAdminUser(user)) {
        throw new ApiError(403, "Access denied: Administrator privileges required");
    }

    const totalVideos = await Video.countDocuments();
    const totalUsers = await User.countDocuments();

    const viewsAndStorageAgg = await Video.aggregate([
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalBytes: { $sum: "$size" }
            }
        }
    ]);

    const totalViews = viewsAndStorageAgg[0]?.totalViews || 0;
    const totalBytes = viewsAndStorageAgg[0]?.totalBytes || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalUsers,
                totalViews,
                totalBytes,
                totalMB: (totalBytes / (1024 * 1024)).toFixed(1),
                totalGB: (totalBytes / (1024 * 1024 * 1024)).toFixed(2)
            },
            "Admin statistics fetched successfully"
        )
    );
});

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { title, description, tags } = req.body;
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "Video Id not found");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found in database");
    }

    const userID = req.user?._id;
    if (!userID) {
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!");
    }
    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(404, "User not found in database");
    }

    const isAdmin = isAdminUser(user);
    if (user._id.toString() !== video.owner.toString() && !isAdmin) {
        throw new ApiError(401, "User not authorized, video details can only be changed by owner or administrator");
    }

    const updateFields = {};
    if (title) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();

    if (tags !== undefined) {
        if (Array.isArray(tags)) {
            updateFields.tags = tags.map((t) => t.trim()).filter(Boolean);
        } else if (typeof tags === "string") {
            updateFields.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
        }
    }

    const newVideo = await Video.findByIdAndUpdate(
        video._id,
        {
            $set: updateFields
        },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, newVideo, "Video data updated successfully"));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const thumbnailFilePath = req.file?.path;
    if (!thumbnailFilePath) {
        throw new ApiError(404, "Thumbnail file is required");
    }

    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(404, "Video Id not found");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found in database");
    }

    const userID = req.user?._id;
    if (!userID) {
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!");
    }
    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(404, "User not found in database");
    }

    const isAdmin = isAdminUser(user);
    if (user._id.toString() !== video.owner.toString() && !isAdmin) {
        throw new ApiError(401, "User not authorized, video details can only be changed by owner or administrator");
    }

    let thumbnail;
    try {
        thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    } catch (error) {
        console.log("Error in uploading thumbnail", error);
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    const publicId = extractPublicId(video.thumbnail);
    await deleteFromCloudinary(publicId);

    const newVideo = await Video.findByIdAndUpdate(
        video._id,
        {
            $set: {
                thumbnail: thumbnail.secure_url
            }
        },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, newVideo, "Video thumbnail updated successfully"));
});

// Delete Video (Owner or Administrator override)
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(404, "Video Id not found");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found in database");
    }

    const userID = req.user?._id;
    if (!userID) {
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!");
    }
    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(404, "User not found in database");
    }

    const isAdmin = isAdminUser(user);
    if (user._id.toString() !== video.owner.toString() && !isAdmin) {
        throw new ApiError(401, "User not authorized, video can only be deleted by owner or administrator");
    }

    const videoFilePublicId = extractPublicId(video.videoFile);
    await deleteVideoFromCloudinary(videoFilePublicId);

    const thumbnailPublicId = extractPublicId(video.thumbnail);
    await deleteFromCloudinary(thumbnailPublicId);

    await Video.findByIdAndDelete(video._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            isAdmin && user._id.toString() !== video.owner.toString()
                ? "Video deleted successfully by Administrator"
                : "Video deleted successfully"
        )
    );
});

const getUploadedVideos = asyncHandler(async (req, res) => {
    const userID = req.user?._id;
    if (!userID) {
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!");
    }
    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(404, "User not found in database");
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                size: 1,
                views: 1,
                tags: 1,
                createdAt: 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, videos, "List of uploaded videos fetched successfully"));
});

export {
    uploadVideo,
    getVideoDetails,
    getAllVideos,
    getAllTags,
    getStorageUsage,
    getAdminStats,
    viewVideo,
    updateVideoDetails,
    updateVideoThumbnail,
    deleteVideo,
    getUploadedVideos
};