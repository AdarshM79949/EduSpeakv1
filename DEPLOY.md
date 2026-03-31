# EduSpeak Deployment Guide

## Architecture

```
┌─────────────┐     API calls     ┌──────────────┐     Discord.js     ┌─────────────┐
│   Frontend   │ ──────────────► │   Backend     │ ──────────────► │  Discord DB  │
│   (Vercel)   │ ◄────────────── │  (Railway)    │ ◄────────────── │  (Channels)  │
│  Vite/React  │     JSON        │  Express.js   │     Messages    │              │
└─────────────┘                  └──────────────┘                  └─────────────┘
```

## Step 1: Deploy Backend on Railway (free)

1. Go to [railway.app](https://railway.app) → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select `AdarshM79949/EduSpeakv1`
4. Set **Root Directory** to `backend`
5. Go to **Variables** tab and add ALL these environment variables:

```
BOT_TOKEN=<your discord bot token>
GUILD_ID=<your guild id>
JWT_SECRET=<your jwt secret>
JWT_EXPIRES_IN=7d
PORT=3000
CHANNEL_USERS=<channel id>
CHANNEL_SESSIONS=<channel id>
CHANNEL_LESSONS=<channel id>
CHANNEL_MODULES=<channel id>
CHANNEL_QUIZZES=<channel id>
CHANNEL_QUIZ_RESULTS=<channel id>
CHANNEL_SPEAKING_SESSIONS=<channel id>
CHANNEL_SPEAKING_RESULTS=<channel id>
CHANNEL_GRADES=<channel id>
CHANNEL_PROGRESS=<channel id>
CHANNEL_ANNOUNCEMENTS=<channel id>
CHANNEL_FEEDBACK=<channel id>
CHANNEL_LOGS=<channel id>
CHANNEL_PASSWORD_RESETS=<channel id>
CHANNEL_SETTINGS=<channel id>
```

> Copy all values from your local `backend/.env` file

6. Railway will auto-deploy. Note the public URL like `https://eduspeak-backend.up.railway.app`

## Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"** → Import `AdarshM79949/EduSpeakv1`
3. Set **Root Directory** to `app`
4. Set **Framework Preset** to `Vite`
5. Add this **Environment Variable**:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
6. Click **Deploy**

## Step 3: Update Frontend API Base URL

After deploying the backend on Railway, update the frontend to use the Railway URL instead of localhost. The API calls currently use relative paths like `/api/lessons`, which work with the Vite proxy in development. For production, you need to configure the base URL.

The `vercel.json` in the `app/` folder should handle rewrites:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-railway-url.up.railway.app/api/:path*" }
  ]
}
```

## Where to Find Your Env Values

All your environment variable values are in your local file:
```
backend/.env
```

This file was NOT pushed to GitHub (protected by .gitignore). Copy the values from there into Railway's Variables dashboard.

## Login Credentials

- Student: `student@eduspeak.com` / `student123`
- Teacher: `teacher@eduspeak.com` / `teacher123`
- Admin: `admin@eduspeak.com` / `admin123`
