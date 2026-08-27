import mongoose from "mongoose";
import { Playlist } from "../models/playlists.models.js";
import { Video } from "../models/videos.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoId } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(400, "Playlist name is required");
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: (description || "").trim(),
        owner: req.user._id,
        videoList: videoId ? [videoId] : []
    });

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist");
    }

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

// Get User Playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const targetUserId = userId || req.user?._id;

    if (!targetUserId) {
        throw new ApiError(400, "User ID is required");
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(targetUserId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videoList",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            thumbnail: 1,
                            title: 1,
                            duration: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videoList" },
                firstVideoThumbnail: {
                    $ifNull: [{ $arrayElemAt: ["$videos.thumbnail", 0] }, ""]
                }
            }
        },
        {
            $sort: {
                updatedAt: -1
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});

// Get Playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
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
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videoList",
                foreignField: "_id",
                as: "videos",
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
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" }
            }
        }
    ]);

    if (!playlist?.length) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

// Add Video to Playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the owner can modify this playlist");
    }

    if (!playlist.videoList.includes(videoId)) {
        playlist.videoList.push(videoId);
        await playlist.save();
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});

// Remove Video from Playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the owner can modify this playlist");
    }

    playlist.videoList = playlist.videoList.filter((id) => id.toString() !== videoId.toString());
    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
});

// Delete Playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the owner can delete this playlist");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

// Update Playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId || !name?.trim()) {
        throw new ApiError(400, "Playlist ID and name are required");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the owner can update this playlist");
    }

    playlist.name = name.trim();
    if (description !== undefined) {
        playlist.description = description.trim();
    }

    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
