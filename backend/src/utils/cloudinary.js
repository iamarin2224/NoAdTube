import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        
        // Safely clean up local temp file after upload
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (e) {
            console.warn("Failed to delete local temp file after upload:", e.message);
        }

        console.log(`File uploaded to Cloudinary: ${response.secure_url || response.url}`);
        return response;
    } catch (error) {
        console.error("Cloudinary file upload error:", error);
        // Safely clean up local temp file on error
        try {
            if (localFilePath && fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (e) {
            console.warn("Failed to delete local temp file on error:", e.message);
        }
        return null;
    }
};

const extractPublicId = (cloudinaryUrl) => {
    if (!cloudinaryUrl) return "";
    const urlWithoutParams = cloudinaryUrl.split('?')[0];
    const parts = urlWithoutParams.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.replace(/\.[^/.]+$/, ''); // remove extension
    return publicId;
};

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Deleted from Cloudinary with Public ID:", publicId);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};

const deleteVideoFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "video"
        });
        console.log("Deleted video from Cloudinary with Public ID:", publicId);
        return result;
    } catch (error) {
        console.error("Error deleting video from Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary, extractPublicId };