import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token){
        throw new ApiError(401, "Access token not found");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user){
            throw new ApiError(401, "Invalid access token");
        }

        if (user.isVerified === false) {
            throw new ApiError(403, "Account not verified. Please verify your email with the OTP.");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.statusCode === 403) throw error;
        throw new ApiError(401, error?.message || "Unauthorized");
    }
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken._id).select("-password -refreshToken");
            if (user) {
                req.user = user;
            }
        } catch (error) {
            // ignore invalid token for optional routes
        }
    }
    next();
});
