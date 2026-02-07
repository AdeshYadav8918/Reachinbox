# 🚀 Railway Deployment Guide

This guide explains how to deploy the entire **Reachinbox** application (Frontend + Backend + DB) exclusively on **Railway**.

## 🏗 Stack Overview

1.  **Backend Service**: Node.js (Exposes API).
2.  **Frontend Service**: React/Vite (Static Site or Node.js server).
3.  **Database Services**: MySQL & Redis (Managed by Railway).

---

## 1️⃣ Deploying the Backend & Databases

1.  **Sign up** at [railway.app](https://railway.app/).
2.  **New Project** -> **Deploy from GitHub repo**.
3.  Select your repository.
4.  **Add Services (Databases)**:
    *   Right-click the project view -> **New** -> **Database** -> **MySQL**.
    *   Right-click -> **New** -> **Database** -> **Redis**.
5.  **Configure Backend Service**:
    *   **Root Directory**: Leave as `/` (root).
    *   **Start Command**: Railway will auto-detect the root `package.json` which runs `cd backend && npm start`.
    *   **Environment Variables**:
        *   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`: Use values from MySQL service.
        *   `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Use values from Redis service.
        *   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Your Google OAuth credentials.
        *   `FRONTEND_URL`: **We will add this after deploying the frontend.**

---

## 2️⃣ Deploying the Frontend (on Railway)

1.  In the same Railway project, click **New** -> **GitHub Repo**.
2.  Select the **same repository** again.
3.  **Configure Frontend Service**:
    *   Go to **Settings** -> **Root Directory**: Set to `/frontend`.
    *   **Build Command**: `npm run build`
    *   **Start Command**: `npm run preview -- --port $PORT --host` (or use a static server like `serve`).
    *   **Networking**: Click "Generate Domain" to get your public URL (e.g., `frontend-production.up.railway.app`).
4.  **Environment Variables**:
    *   `VITE_API_URL`: Set this to your **Backend Service URL** (e.g., `https://backend-production.up.railway.app`).

---

## 3️⃣ Final Wiring

1.  Copy the **Frontend Domain** (e.g., `https://frontend-production.up.railway.app`).
2.  Go back to **Backend Service** -> **Variables**.
3.  Update `FRONTEND_URL` with the copied domain.
4.  Update your **Google Cloud Console** "Authorized Redirect URIs" to match.
5.  Redeploy both services.

---

## ✅ Verification
Open your Frontend URL. It should load the login page and connect to the Backend (via the `VITE_API_URL`).
