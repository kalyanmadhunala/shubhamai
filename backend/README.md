# ShubhaMAI — Backend

AI-powered poster generator backend for the ShubhaMAI React Native app.  
Built with **Node.js · Express · MongoDB · Gemini API · Cloudinary · Nodemailer**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Environment Setup](#environment-setup)
4. [Installation](#installation)
5. [Running the Server](#running-the-server)
6. [Seeding the Database](#seeding-the-database)
7. [API Overview](#api-overview)
8. [Rate Limiting](#rate-limiting)
9. [Cron Jobs](#cron-jobs)
10. [Tech Stack](#tech-stack)

---

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 18.x or higher |
| npm | 9.x or higher |
| MongoDB | Atlas cluster or local 6.x |
| Gemini API key | Google AI Studio |
| Cloudinary account | cloudinary.com |
| SMTP / Gmail app password | For OTP emails |
| Calendarific API key | calendarific.com (optional) |

---

## Project Structure

```
backend/
├── server.js                    # Entry point
├── package.json
├── .env.example                 # Copy → .env and fill values
│
├── config/
│   ├── db.js                    # MongoDB connection
│   └── cloudinary.js            # Cloudinary SDK config
│
├── models/
│   ├── User.model.js            # User schema (auth, business profile, saved posters)
│   └── Event.model.js           # Event schema (regional holidays & festivals)
│
├── middleware/
│   └── auth.middleware.js       # JWT protect() middleware
│
├── services/
│   ├── email.service.js         # Nodemailer — OTP emails
│   ├── gemini.service.js        # Gemini Flash (prompts) + Imagen (poster images)
│   ├── cloudinary.service.js    # Upload / delete poster images
│   └── calendarific.service.js  # Calendarific holiday API wrapper
│
├── controllers/
│   ├── auth.controller.js       # Sign up, login, OTP, reset password
│   ├── event.controller.js      # Fetch, search, seed events
│   ├── poster.controller.js     # Generate, save, delete posters
│   └── user.controller.js       # Profile, business info, important dates
│
├── routes/
│   ├── auth.routes.js
│   ├── event.routes.js
│   ├── poster.routes.js
│   └── user.routes.js
│
├── utils/
│   ├── cronJobs.js              # OTP cleanup cron jobs
│   └── seedEvents.js            # One-time DB seeder script
│
└── data/
    └── telanganaEvents.json     # Static fallback event data for Telangana
```

---

## Environment Setup

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

```env
# ── Server ────────────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development           # 'development' or 'production'
CLIENT_URL=http://localhost:8081  # React Native Metro / Expo URL

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shubhamai

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# ── Gemini (Google AI) ────────────────────────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here

# ── Cloudinary ────────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ── Nodemailer / Gmail ────────────────────────────────────────────────────────
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password   # 16-char App Password (not account password)
EMAIL_FROM=ShubhaMAI <your_gmail_address@gmail.com>

# ── Calendarific (optional) ───────────────────────────────────────────────────
CALENDARIFIC_API_KEY=your_calendarific_api_key
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail".

---

## Installation

```bash
# Clone / navigate to the backend directory
cd ShubhaMAI/backend

# Install dependencies
npm install
```

---

## Running the Server

```bash
# Development (hot-reload via nodemon)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:5000` (or the `PORT` in `.env`).

Health check: `GET http://localhost:5000/api/health`

Expected response:
```json
{
  "success": true,
  "message": "ShubhaMAI backend is running 🚀",
  "timestamp": "2024-12-01T10:00:00.000Z"
}
```

---

## Seeding the Database

Run the seed script **once** after first setup to populate Telangana, national, and international events:

```bash
npm run seed
```

The seeder is **idempotent** — it skips events that already exist (matched by `name + region`). Safe to re-run.

To use the static JSON fallback directly (e.g., for a bulk API call):
```bash
# The file is at:
backend/data/telanganaEvents.json
```
You can POST the JSON array to `POST /api/events/bulk` to load it into MongoDB manually.

---

## API Overview

All endpoints are prefixed with `/api`. Full details: [`docs/api.md`](docs/api.md).

| Group | Base Path | Auth Required |
|-------|-----------|:---:|
| Health | `/api/health` | ❌ |
| Auth | `/api/auth` | ❌ |
| Events | `/api/events` | ✅ JWT |
| Posters | `/api/poster` | ✅ JWT |
| User | `/api/user` | ✅ JWT |

Protected routes require the header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Rate Limiting

| Scope | Limit |
|-------|-------|
| All `/api/*` routes | 100 requests / 15 min per IP |
| All `/api/auth/*` routes | 10 requests / 10 min per IP |

Exceeding limits returns:
```json
{ "success": false, "message": "Too many requests. Please try again later." }
```

---

## Cron Jobs

Two background jobs start automatically with the server:

| Job | Schedule | Purpose |
|-----|----------|---------|
| OTP Cleanup | Every 2 minutes | Deletes unverified users older than 10 minutes |
| Stale OTP Flush | Daily at midnight | Clears leftover OTP fields from verified users |

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| `express` | HTTP server & routing |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing (12 rounds) |
| `jsonwebtoken` | JWT auth tokens |
| `nodemailer` | OTP email delivery |
| `@google/generative-ai` | Gemini Flash — prompt generation |
| `axios` | Gemini Imagen REST calls |
| `cloudinary` | Poster image storage |
| `node-cron` | Background cleanup jobs |
| `express-rate-limit` | Abuse prevention |
| `helmet` | HTTP security headers |
| `cors` | Cross-origin policy |
| `morgan` | Dev HTTP logger |
| `nodemon` | Dev hot-reload |