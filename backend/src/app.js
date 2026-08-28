import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express(); 

// Cross-Origin-Opener-Policy (COOP) header for Google OAuth popups
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});

// Configure CORS with trailing slash trimming and credentials
const rawOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
const allowedOrigins = rawOrigin
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

// Ensure Vercel deployment and localhost are always included
const defaultAllowed = ["http://localhost:5173", "https://noadtube-iota.vercel.app"];
defaultAllowed.forEach((orig) => {
    if (!allowedOrigins.includes(orig)) {
        allowedOrigins.push(orig);
    }
});

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (e.g. mobile apps, curl, postman)
            if (!origin) return callback(null, true);
            const cleanOrigin = origin.trim().replace(/\/+$/, "");
            if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes("*")) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With", "Accept"],
        exposedHeaders: ["Set-Cookie"]
    })
);

// Common middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

// Routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Only log unexpected server errors (500), not expected 401/403/404 client checks
    if (statusCode >= 500) {
        console.error(`[Server Error] ${statusCode}:`, err);
    }

    return res.status(statusCode).json({
        statusCode,
        data: null,
        message,
        success: false,
        errors: err.errors || []
    });
});

export { app };