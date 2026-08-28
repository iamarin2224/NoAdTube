# NoAdTube - Frontend Web Application 🎥

**NoAdTube** is an ad-free, high-performance video streaming single-page application built with **React**, **Vite**, **Tailwind CSS**, and **TanStack Query**. It delivers a YouTube-inspired visual design and user experience, seamlessly communicating with the NoAdTube RESTful API.

---

## 🌟 Key Features

### 1. 📺 Video Player, Queue & Autoplay
- **HTML5 Player:** Native responsive video playback with automatic view-count tracking after 3 seconds of watch time.
- **Smart Queue System:** Add any video to your floating playback queue via the 3-dot action menu or watch page action bar.
- **Continuous Autoplay:** Automatically progresses to the next video in queue upon finish; if queue is empty and Autoplay is enabled, seamlessly plays the top related video.
- **Floating Queue Controller:** Expandable bottom-right drawer to view remaining queued tracks, reorder, clear, or trigger "Play All".
- **Compact "Up Next" Sidebar:** Pixel-perfect YouTube-style horizontal cards with fixed aspect-ratio thumbnails, truncated titles, channel details, and 3-dot menus.

### 2. 🏷️ Dynamic Video Tags & Categorized Feeds
- **Tagging on Upload & Edit:** Creators can tag videos with preset topics (Coding, Music, Gaming, Tech, Tutorials, Podcasts) or custom tags.
- **Dynamic Tag Filter Bar:** Home feed automatically surfaces active tags, filtering videos instantly.
- **Interactive Hashtags:** Clickable `#tags` on video descriptions allow quick topic exploration.

### 3. 📑 Playlist Management
- **YouTube-Style Save Flow:** Click "Save" on any video or from the 3-dot menu to open a quick modal with playlist checkboxes and "+ Create new playlist" action.
- **Playlists Hub (`/playlists`):** View all curated collections with video count badges, playlist cover previews, and instant play options.
- **Playlist Detail Page (`/playlist/:playlistId`):** Hero banner with "Play All" button, playlist stats, video list, and video removal options for owners.
- **Sidebar Integration:** Quick access to user playlists under the "You" section and dynamic playlist list.

### 4. 🔒 Safe URL ID Obfuscation (Encoding / Decoding)
- Frontend URLs never expose raw 24-character MongoDB ObjectIds in browser address bars.
- Bidirectional XOR + Base64URL encoding converts database IDs into URL-safe slugs (e.g. `/watch/v_k7X2m...`, `/playlist/v_9mK4...`), with transparent decoding on route resolution.

### 5. 🔐 Dual Authentication: Nodemailer OTP & Google OAuth
- **Google Social Sign-In:** One-click authentication with Google OAuth (`@react-oauth/google`).
- **Email OTP Verification:** Standard sign-up and sign-in routes with secure 6-digit email OTPs sent via Nodemailer Gmail SMTP.
- **Dynamic First-Letter Avatars:** Optional avatar upload automatically falls back to clean, color-styled letter avatars generated from the user's initial.
- **Route Guards:** `ProtectedRoute` strictly requires verified authentication (`isVerified === true`), and `PublicOnlyRoute` protects auth screens.

### 6. 💬 Social Interactions & Creator Studio
- **Likes & Subscriptions:** Real-time optimistic toggling with subscriber & like counters.
- **Community Posts (`/tweets`):** Short announcements with nested comment threads.
- **Creator Studio (`/my-videos`):** Manage published content, edit titles/descriptions/tags, update thumbnails, and delete videos.
- **Channel Pages (`/channel/:username`):** Complete channel view with video feeds, community posts, subscriber counts, and channel banners.

### 7. 🛡️ Administrator Control Panel & Storage Quotas
- **Account-Level Storage Limits:** 1 GB video upload quota per standard account with live progress bar and validation in the upload modal.
- **Exempt / Unlimited Accounts:** `iamarindas@gmail.com` (`iamarindas`) and `noadtube.online@gmail.com` enjoy unlimited upload capacity.
- **Admin Control Panel (`/admin`):** Dedicated dashboard for `noadtube.online@gmail.com` featuring platform-wide metrics (total videos, users, views, storage consumed) and full moderation privileges to delete any video across the platform.

---

## 🛠 Tech Stack

* **Framework:** React 18+ with Vite
* **Styling:** Tailwind CSS (YouTube Dark Theme)
* **Routing:** React Router v6
* **Data Fetching & Cache:** TanStack Query (React Query)
* **HTTP Client:** Axios with `withCredentials: true` and 401 token refresh interceptors
* **Icons:** Lucide React
* **Auth Providers:** Google OAuth 2.0 (`@react-oauth/google`)
* **Utilities:** `date-fns`, Custom ID Obfuscator (`idEncoder.js`)

---

## 📁 Directory Structure

```text
frontend/
├── src/
│   ├── api/                # Axios API client modules (auth, video, playlist, comment, like, tweet, subscription)
│   ├── components/
│   │   ├── auth/           # ProtectedRoute, PublicOnlyRoute, GoogleSignInButton
│   │   ├── common/         # Button, Input, Modal, Avatar, Skeleton
│   │   ├── layout/         # Navbar with live search suggestions, Sidebar, AppLayout
│   │   ├── video/          # VideoPlayer, VideoCard, VideoActions, VideoActionMenu, RelatedVideos, VideoGrid
│   │   ├── playlist/       # SaveToPlaylistModal
│   │   ├── queue/          # QueueDrawer
│   │   ├── comment/        # CommentSection, CommentItem, CommentInput
│   │   ├── tweet/          # TweetCard, TweetComposer
│   │   └── upload/         # UploadModal with tags selector & upload progress
│   ├── context/            # AuthContext, UIContext, QueueContext
│   ├── pages/              # Home, Watch, Playlists, PlaylistDetail, Studio, History, Liked, Channel, Auth pages
│   ├── utils/              # formatters (duration, views, time), idEncoder
│   ├── App.jsx             # Route definitions
│   └── main.jsx            # Providers root (GoogleOAuth, QueryClient, Auth, UI, Queue)
├── .env                    # Frontend environment configuration
├── vite.config.js
└── package.json
```

---

## 🌐 Environment Variables

Create a `.env` file in the `/frontend` directory:

```env
# Development
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Production (Render Backend)
# VITE_API_BASE_URL=https://<your-render-backend-url>/api/v1

VITE_GOOGLE_CLIENT_ID=776457487628-867sukk5uhkgb1bv2jahl6eb2edgqa8h.apps.googleusercontent.com
```

*Note: Axios is configured with `withCredentials: true` across all requests to support cross-domain authentication between Vercel and Render.*

---

## 🚀 Running the Project

### 1. Start the Development Server
```bash
cd frontend
npm install
npm run dev
# Starts Vite dev server on http://localhost:5173
```

### 2. Build for Production
```bash
npm run build
# Generates production bundle in /frontend/dist
```

---

## 🧑‍💻 Author
**Arin Das** — Jadavpur University
