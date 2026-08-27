import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import { Comment } from "../models/comments.models.js";
import { Tweet } from "../models/tweets.models.js";
import { Video } from "../models/videos.models.js";
import { Like } from "../models/likes.models.js";
import mongoose from "mongoose";

const likeVideo = asyncHandler(async (req, res) => {

    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(404, "Video Id not found");
    }
    const video = await Video.findById(videoId)
    if (!video){
        throw new ApiError(404, "Video not found in database");
    }

    const userID = req.user?._id
    if(!userID){
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!")
    }
    const user = await User.findById(userID)
    if (!user){
        throw new ApiError(404, "User not found in database")
    }

    const existingRecord = await Like.findOne({
        videoId: video._id,
        owner: user._id
    }).lean()

    const isLiked = !!existingRecord

    if (isLiked){
        throw new ApiError(400, "Video already liked")
    }

    try {
        const like = await Like.create({
            videoId,
            owner: user._id
        })

        const createdLike = await Like.findById(like._id).select("-tweetId -commentId")

        if (!createdLike) {
            throw new ApiError(500, "Something went wrong, cant like.")
        }

        return res.status(201).json(new ApiResponse(201, createdLike, "Video was liked successfully"))

    } catch (error) {
        console.log("Error in liking the video, error:", error);
        throw new ApiError(500, "Somthing went wrong while liking")
    }

})

const likeTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params;
    if(!tweetId){
        throw new ApiError(404, "Tweet Id not found");
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet){
        throw new ApiError(404, "Tweet not found in database");
    }

    const userID = req.user?._id
    if(!userID){
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!")
    }
    const user = await User.findById(userID)
    if (!user){
        throw new ApiError(404, "User not found in database")
    }

    const existingRecord = await Like.findOne({
        tweetId: tweet._id,
        owner: user._id
    }).lean()

    const isLiked = !!existingRecord

    if (isLiked){
        throw new ApiError(400, "Tweet already liked")
    }

    try {
        const like = await Like.create({
            tweetId,
            owner: user._id
        })

        const createdLike = await Like.findById(like._id).select("-videoId -commentId")

        if (!createdLike) {
            throw new ApiError(500, "Something went wrong, cant like.")
        }

        return res.status(201).json(new ApiResponse(201, createdLike, "Tweet was liked successfully"))

    } catch (error) {
        console.log("Error in liking the tweet, error:", error);
        throw new ApiError(500, "Somthing went wrong while liking")
    }
    
})

const likeComment = asyncHandler(async (req, res) => {

    const {commentId} = req.params;
    if(!commentId){
        throw new ApiError(404, "Comment Id not found");
    }
    const comment = await Comment.findById(commentId)
    if (!comment){
        throw new ApiError(404, "Comment not found in database");
    }

    const userID = req.user?._id
    if(!userID){
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!")
    }
    const user = await User.findById(userID)
    if (!user){
        throw new ApiError(404, "User not found in database")
    }

    const existingRecord = await Like.findOne({
        commentId: comment._id,
        owner: user._id
    }).lean()

    const isLiked = !!existingRecord

    if (isLiked){
        throw new ApiError(400, "Comment already liked")
    }

    try {
        const like = await Like.create({
            commentId,
            owner: user._id
        })

        const createdLike = await Like.findById(like._id).select("-tweetId -videoId")

        if (!createdLike) {
            throw new ApiError(500, "Something went wrong, cant like.")
        }

        return res.status(201).json(new ApiResponse(201, createdLike, "Comment was liked successfully"))

    } catch (error) {
        console.log("Error in liking the comment, error:", error);
        throw new ApiError(500, "Somthing went wrong while liking")
    }
    
})

const unlike = asyncHandler(async (req, res) => {

    const {likeId} = req.params
    if(!likeId){
        throw new ApiError(404, "Like Id not found")
    }
    const like = await Like.findById(likeId)
    if (!like){
        throw new ApiError(404, "Like not found in database")
    }

    const userID = req.user?._id
    if(!userID){
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!")
    }
    const user = await User.findById(userID)
    if (!user){
        throw new ApiError(404, "User not found in database")
    }

    const existingRecord = await Like.findOne({
        _id: like._id,
        owner: user._id
    }).lean()

    const isLiked = !!existingRecord;

    if (isLiked){
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, {}, "Unliked successfully")) 
    }
    else{
        throw new ApiError(400, "The like is not made by user")
    }

})

const getLikesCount = asyncHandler(async (req, res) => {
    const {type, id} = req.params
    if(!type || !id){
        throw new ApiError(400, "Both type and id are required")
    }

    const filter = {}

    if (type==="video") {
        filter.videoId = id;
        const video = await Video.findById(id)
        if (!video){
            throw new ApiError(404, "Video not found in database");
        }
    }
    else if (type==="tweet") {
        filter.tweetId = id;
        const tweet = await Tweet.findById(id)
        if (!tweet){
            throw new ApiError(404, "Tweet not found in database");
        }
    }
    else if (type==="comment") {
        filter.commentId = id;
        const comment = await Comment.findById(id)
        if (!comment){
            throw new ApiError(404, "Comment not found in database");
        }
    }
    else throw new ApiError(400, "Invalid content type")

    const count = await Like.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, count, "Likes count fetched successfully"))
})

const likeStatus = asyncHandler(async (req, res) => {

    const userID = req.user?._id
    if(!userID){
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!")
    }
    const user = await User.findById(userID)
    if (!user){
        throw new ApiError(404, "User not found in database")
    }

    const {type, id} = req.params
    if(!type || !id){
        throw new ApiError(400, "Both type and id are required")
    }

    let existingRecord;

    if (type==="video") {
        const video = await Video.findById(id)
        if (!video){
            throw new ApiError(404, "Video not found in database");
        }

        existingRecord = await Like.findOne({
            videoId: id,
            owner: user._id
        })
    }

    else if (type==="tweet") {
        const tweet = await Tweet.findById(id)
        if (!tweet){
            throw new ApiError(404, "Tweet not found in database");
        }

        existingRecord = await Like.findOne({
            tweetId: id,
            owner: user._id
        })
    }

    else if (type==="comment") {
        const comment = await Comment.findById(id)
        if (!comment){
            throw new ApiError(404, "Comment not found in database");
        }

        existingRecord = await Like.findOne({
            commentId: id,
            owner: user._id
        })
    }

    else throw new ApiError(400, "Invalid content type")

    const isLiked = !!existingRecord;

    return res.status(200).json(new ApiResponse(200, { isLiked, likeId: existingRecord?._id || null }, "Like status fetched successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userID = req.user?._id;
    if (!userID) {
        throw new ApiError(404, "User Id not found. Please log in.");
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userID),
                videoId: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videoId",
                foreignField: "_id",
                as: "video",
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
            $unwind: "$video"
        },
        {
            $project: {
                _id: 1,
                likedAt: "$createdAt",
                video: 1
            }
        },
        { $sort: { likedAt: -1 } }
    ]);

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

const toggleLike = asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    const userID = req.user?._id;
    if (!userID) {
        throw new ApiError(404, "User Id not found");
    }

    const filter = { owner: userID };
    if (type === "video") filter.videoId = id;
    else if (type === "tweet") filter.tweetId = id;
    else if (type === "comment") filter.commentId = id;
    else throw new ApiError(400, "Invalid content type");

    const existingLike = await Like.findOne(filter);
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        const count = await Like.countDocuments(
            type === "video" ? { videoId: id } : type === "tweet" ? { tweetId: id } : { commentId: id }
        );
        return res.status(200).json(new ApiResponse(200, { isLiked: false, likeId: null, count }, "Unliked successfully"));
    } else {
        const newLike = await Like.create(filter);
        const count = await Like.countDocuments(
            type === "video" ? { videoId: id } : type === "tweet" ? { tweetId: id } : { commentId: id }
        );
        return res.status(201).json(new ApiResponse(201, { isLiked: true, likeId: newLike._id, count }, "Liked successfully"));
    }
});

export {
    likeVideo,
    likeTweet,
    likeComment,
    unlike,
    getLikesCount,
    likeStatus,
    getLikedVideos,
    toggleLike
}