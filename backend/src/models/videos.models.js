import mongoose, {Schema} from "mongoose";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Cloudinary URL
            required: true
        },
        thumbnail: {
            type: String, // Cloudinary URL
            required: true
        },
        title: {
            type: String, 
            required: true,
            trim: true
        },
        description: {
            type: String, 
            required: true
        },
        tags: [
            {
                type: String,
                trim: true
            }
        ],
        views: {
            type: Number,
            default: 0
        },
        duration: {
            type: Number,
            required: true
        },
        size: {
            type: Number, // File size in bytes
            default: 0
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

export const Video = mongoose.model("Video", videoSchema);