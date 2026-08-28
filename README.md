# NoAdTube 🎥

**NoAdTube** is a modern, high-performance, ad-free video streaming and creator platform inspired by YouTube. Built as a full-stack web application, it offers smooth media playback, real-time community engagement, creator tooling, and robust cloud media management.

---

## ✨ Features at a Glance

* **Ad-Free Video Playback:** Responsive HTML5 video player with watch-history tracking, floating queue management, and continuous autoplay.
* **Dual Authentication:** Secure sign-in via 6-digit Email OTP (Nodemailer) and Google OAuth 2.0, with dynamic initial-letter avatars.
* **Category & Dynamic Tags:** Real-time feed filtering powered by active video tags.
* **Custom Playlists:** Create, curate, and manage private and public video playlists with one-click save flows.
* **Creator Studio & Moderation:** Upload videos with thumbnail previews, manage uploaded content, and administer platform content via a dedicated Admin Panel.
* **Community Interactions:** Tweet-style community posts, nested comments, real-time likes, and channel subscriptions.
* **Production-Ready & Cross-Domain:** Deployed on **Vercel** (Frontend) and **Render** (Backend) with strict CORS, cross-site cookie security (`sameSite: "none"`), and SPA route fallbacks.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, TanStack Query, React Router, Lucide Icons |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose ODM), JWT, Multer, Cloudinary |
| **Authentication** | Google OAuth 2.0, Nodemailer (Gmail SMTP SSL), HTTP-Only Cookies |
| **Hosting** | Vercel (Frontend SPA), Render (Backend API), MongoDB Atlas |

---

## 📁 Repository Overview

```text
NoAdTube/
├── backend/            # Express.js RESTful API & MongoDB database layer
├── frontend/           # React 18 + Vite single-page web application
├── vercel.json         # Vercel deployment configuration & SPA rewrites
└── README.md           # Global project overview
```

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 📚 Detailed Documentation

For comprehensive technical specifications, environment variable guides, and API schemas, refer to the dedicated module documentation:

* **[Backend Documentation](./backend/Readme.md)** — Complete REST API endpoints, controller logic, and storage quota policies.
* **[Frontend Documentation](./frontend/README.md)** — Component architecture, state management, and routing guidelines.

---

## 🧑‍💻 Author

**Arin Das** — Jadavpur University
