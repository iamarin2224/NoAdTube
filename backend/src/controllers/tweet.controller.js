import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import { Tweet } from "../models/tweets.models.js";
import mongoose from "mongoose";

const postTweet = asyncHandler( async (req, res) => {

    const userID = req.user?._id
    if(!userID){
        throw new ApiError(404, "User Id not found. Please log in.")
    }
    const user = await User.findById(userID)
    if (!user){
        throw new ApiError(404, "User not found in database")
    }

    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required.")
    }

    try {

        const tweet = await Tweet.create({
            content,
            owner: user._id
        })

        const postedTweet = await Tweet.findById(tweet._id);
        if (!postedTweet) {
            throw new ApiError(500, "Something went wrong while creating database entry for the tweet")
        }

        return res.status(201).json(new ApiResponse(201, postedTweet, "Tweet posted successfully"))

    } catch (error) {
        
        console.log("Failed to create and post tweer, error: ", error);
        throw new ApiError (500, "Something went wrong while posting the tweet");

    }

})

const editTweet = asyncHandler(async (req, res) => {

    const {content} = req.body

    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(404, "Tweet Id not found")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet){
        throw new ApiError(404, "Tweet not found in database")
    }

    const userID = req.user?._id
    if(!userID){
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!")
    }
    const user = await User.findById(userID)
    if (!user){
        throw new ApiError(404, "User not found in database")
    }

    if (user._id.toString() !== tweet.owner.toString()) {
        throw new ApiError(401, "User not authorized, tweet can only be updated by owner")
    }

    const newTweet = await Tweet.findByIdAndUpdate(
        tweet._id,
        {
            $set: {
                content
            }
        },
        {new: true}
    )
    
    return res.status(200).json(new ApiResponse(200, newTweet, "Tweet edited successfully")) 

})

const deleteTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(404, "Tweet Id not found")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet){
        throw new ApiError(404, "Tweet not found in database")
    }

    const userID = req.user?._id
    if(!userID){
        throw new ApiError(404, "User Id not found. Please ensure you are logged in!")
    }
    const user = await User.findById(userID)
    if (!user){
        throw new ApiError(404, "User not found in database")
    }

    if (user._id.toString() !== tweet.owner.toString()) {
        throw new ApiError(401, "User not authorized, tweet can only be deleted by owner")
    }

    await Tweet.findByIdAndDelete(tweet._id)
    
    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully")) 

})

const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 30, userId } = req.query;
    const match = {};
    if (userId) {
        match.owner = new mongoose.Types.ObjectId(userId);
    }

    const tweets = await Tweet.aggregate([
        { $match: match },
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
                from: "likes",
                localField: "_id",
                foreignField: "tweetId",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "tweetId",
                as: "comments"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" }
            }
        },
        {
            $project: {
                likes: 0
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
    ]);

    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

export {
    postTweet,
    editTweet,
    deleteTweet,
    getAllTweets
}