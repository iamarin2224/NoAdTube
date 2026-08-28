# NoAdTube - Backend RESTful API 🚀

NoAdTube is a scalable, production-grade video-sharing backend built with **Node.js**, **Express.js**, and **MongoDB**. It powers full user authentication (Email OTP & Google OAuth), video streaming, dynamic tagging, custom playlists, comments, likes, subscriptions, and tweets.

---

## 🛠 Tech Stack

* **Runtime & Framework:** Node.js, Express.js
* **Database:** MongoDB via Mongoose ODM
* **Authentication:** JWT (Access & Refresh Tokens) in HTTP-Only Cookies + Google OAuth 2.0
* **Email Verification:** Nodemailer with Gmail SMTP SSL & 6-digit OTP codes
* **Media Storage:** Cloudinary (Video & Thumbnail uploads with cleanup handlers)
* **Middleware:** Multer for multipart file uploads, JWT verification, CORS

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── controllers/        # Request handlers (user, video, playlist, comment, like, tweet, subscription)
│   ├── db/                 # MongoDB connection initialization
│   ├── middlewares/        # JWT auth, optional auth, and Multer file upload handlers
│   ├── models/             # Mongoose schemas (User, Video, Playlist, Comment, Like, Tweet, Subscription)
│   ├── routes/             # Express API routes
│   ├── utils/              # ApiError, ApiResponse, asyncHandler, Cloudinary, Mailer
│   ├── app.js              # Express app configuration & global error middleware
│   ├── constants.js        # Global constants & DB name
│   └── index.js            # Server entry point with environment resolution
├── .env                    # Backend environment configuration
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `/backend` directory:

```env
PORT=8000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
CORS_ORIGIN=https://noadtube-iota.vercel.app

ACCESS_TOKEN_SECRET=your_jwt_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

GMAIL_USER=noadtube.online@gmail.com
GMAIL_APP_PASS=your_16_char_app_password
```

---

## 🌐 Production Deployment & Security Configuration

* **Cross-Origin Cookie Flags (`sameSite: "none"` & `secure: true`)**: In `NODE_ENV=production`, authentication cookies (`accessToken`, `refreshToken`) and cookie clearing (`res.clearCookie`) use `sameSite: "none"` and `secure: true` to enable cross-domain cookie transmission between Vercel and Render.
* **Strict CORS & Preflight Handling**: Automatically cleans trailing slashes from `CORS_ORIGIN`, allowing seamless communication with `https://noadtube-iota.vercel.app` with `credentials: true`.
* **Google OAuth COOP Policy**: Emits `Cross-Origin-Opener-Policy: same-origin-allow-popups` to avoid popup closure errors during Google OAuth authorization.
* **Multer Temp Directory & Safe Cleanup**: Automatically verifies and creates `./public/temp` on application startup to prevent upload directory errors in cloud environments (Render). Temp files are safely deleted via defensive try/catch blocks after Cloudinary processing.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run Development Server
```bash
npm run dev
# Starts backend server on http://localhost:8000
```

---

## 📚 API Endpoints Reference

### 🔐 Authentication & Users (`/api/v1/users`)
* `POST /register` – Register new account & trigger Nodemailer OTP email.
* `POST /verify-otp` – Verify 6-digit email OTP and issue JWT auth tokens.
* `POST /resend-otp` – Resend OTP code with a 60-second cooldown window.
* `POST /google-auth` – Google Social Sign-In / Sign-Up via Google ID Token.
* `POST /login` – Sign in with username/email and password.
* `POST /logout` – Clear HTTP-only session cookies.
* `POST /refresh-token` – Refresh access token using refresh token.
* `GET /current-user` – Get authenticated user profile.
* `PATCH /update-account` – Update full name and email.
* `PATCH /avatar` – Upload and update avatar image.
* `PATCH /cover-image` – Upload and update channel banner.
* `POST /change-password` – Update user account password.
* `GET /c/:username` – Retrieve public channel details with subscriber counts.
* `GET /history` – Retrieve user's watch history.
* `DELETE /history` – Clear user's watch history.

### 📹 Videos (`/api/v1/videos`)
* `GET /` or `GET /all` – Get videos feed (supports `query`, `tag`, `subscribed`, pagination, sorting).
* `GET /tags` – Fetch list of all active video category tags from database videos.
* `GET /storage-usage` – Get account video storage consumption and limits (1 GB quota per standard account; unlimited for `iamarindas@gmail.com` and `noadtube.online@gmail.com`).
* `GET /admin/stats` – Fetch platform-wide metrics (Videos, Users, Views, Total MB) for Administrator.
* `POST /upload-video` – Upload video file + thumbnail with title, description, tags, and quota validation.
* `GET /get/:videoId` – Fetch video details with author subscription status.
* `PATCH /view/:videoId` – Increment view count and record in watch history.
* `PATCH /update/:videoId` – Update video title, description, and tags (Owner or Admin).
* `PATCH /update/thumbnail/:videoId` – Update video thumbnail image.
* `DELETE /delete/:videoId` – Delete video and associated Cloudinary assets (Owner or Administrator override).
* `GET /uploaded-videos` – Get creator's uploaded videos list.

### 📑 Playlists (`/api/v1/playlists`)
* `POST /` – Create new playlist with optional initial video.
* `GET /my` – Fetch authenticated user's playlists with thumbnails and video counts.
* `GET /user/:userId` – Get public playlists of a specific user.
* `GET /:playlistId` – Get playlist details and populated video list.
* `PATCH /:playlistId` – Update playlist name and description.
* `DELETE /:playlistId` – Delete playlist.
* `PATCH /add/:videoId/:playlistId` – Add video to playlist.
* `PATCH /remove/:videoId/:playlistId` – Remove video from playlist.

### 💬 Comments (`/api/v1/comments`)
* `GET /video/:videoId` – Get comments on a video.
* `POST /video/:videoId` – Post comment on a video.
* `GET /tweet/:tweetId` – Get comments on a tweet.
* `POST /tweet/:tweetId` – Post comment on a tweet.
* `PATCH /c/:commentId` – Update comment.
* `DELETE /c/:commentId` – Delete comment.

### 👍 Likes (`/api/v1/likes`)
* `POST /toggle/v/:videoId` – Toggle like on video.
* `POST /toggle/t/:tweetId` – Toggle like on tweet.
* `POST /toggle/c/:commentId` – Toggle like on comment.
* `GET /status/:type/:id` – Check if current user liked item.
* `GET /count/:type/:id` – Get total likes count.
* `GET /videos` – Get user's liked videos list.

### 🐦 Community Posts / Tweets (`/api/v1/tweets`)
* `GET /` – Get all community posts feed.
* `POST /` – Create community post.
* `GET /user/:userId` – Get posts by user.
* `PATCH /:tweetId` – Update community post.
* `DELETE /:tweetId` – Delete community post.

### 🔔 Subscriptions (`/api/v1/subscriptions`)
* `POST /c/:username` – Toggle subscribe/unsubscribe to channel.
* `GET /u/:subscriberId` – Get list of channels user is subscribed to.
* `GET /c/:channelId` – Get list of subscribers for a channel.

---

## 🧑‍💻 Author
**Arin Das** — Jadavpur University
