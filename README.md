# Reachinbox Assignment - Email Scheduling & Analytics Platform

A full-stack email outreach platform featuring Google OAuth, automated scheduling, and a responsive analytics dashboard.

## 🚀 Quick Start

### Prerequisites
-   Node.js (v18+)
-   Docker Desktop (for MySQL & Redis)

### 1. Run Backend (Express, Redis, DB, BullMQ)
The backend handles authentication, email scheduling (BullMQ), and API requests.

1.  **Start Infrastructure**:
    ```bash
    docker-compose up -d
    ```
    *Starts MySQL (port 3306) and Redis (port 6379).*

2.  **Install & Run**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```
    *Server runs on `http://localhost:3000`.*

### 2. Run Frontend (React + Vite)
The frontend provides the dashboard and login interface.

1.  **Install & Run**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *Runs on `http://localhost:5173` (or 5177 if 5173 is busy).*

### 3. Setup Ethereal Email & Environment
This project uses **Ethereal Email** to simulate sending emails without spamming real users.

1.  Go to [ethereal.email](https://ethereal.email/) and click "Create Account".
2.  Copy your `user` and `pass`.
3.  Update `backend/.env` (create if missing):
    ```env
    SMTP_USER=your_ethereal_email
    SMTP_PASS=your_ethereal_password
    # ... other vars (DB, Redis, Google) as per .env.example
    ```

---

## 🏗 Architecture Overview

### How Scheduling Works
1.  **Submission**: When a user schedules an email, the backend calculates the delay (`scheduledTime - now`).
2.  **Queueing**: The job is added to a **BullMQ** queue (`email-queue`) backed by **Redis**.
3.  **worker**: A dedicated worker process picks up jobs when their delay expires.
4.  **Processing**: The worker verifies the job in the DB, checks rate limits, and sends the email via Nodemailer (Ethereal).

### Persistence on Restart
*   **Database (MySQL)**: Stores the "source of truth" (`scheduled_emails` table). If the server crashes, the records remain `scheduled` or `queued`.
*   **Queue (Redis)**: BullMQ persists pending jobs in Redis (AOF/RDB persistence enabled by Docker default).
*   **Recovery**: On restart, Redis retains the jobs. If Redis were wiped, the backend (feature pending) could re-sync from MySQL, but BullMQ's Redis persistence handles standard restarts seamlessly.

### Rate Limiting & Concurrency
*   **Concurrency**: The worker is configured with `workerConcurrency: 5` (default), processing 5 emails in parallel.
*   **Rate Limiting**:
    1.  **Queue Level**: BullMQ limiter is set to `maxEmailsPerHour` (default 200) per hour.
    2.  **User Level**: A custom Redis-based `checkRateLimit(userId)` function ensures no single user exceeds their quota. If exceeded, the job is **rescheduled** automatically for the next available slot.

---

## ✅ Features Implemented

### Backend
*   **Scheduler**: Automated email dispatch using BullMQ + Redis.
*   **Persistence**: MySQL storage for campaigns/emails; Redis for job state.
*   **Rate Limiting**: Two-layer protection (Queue-global + User-specific) with auto-rescheduling.
*   **Concurrency**: Multi-threaded worker processing.
*   **Resilience**: Graceful handling of DB connection failures.

### Frontend
*   **Login**: Google OAuth integration + "Guest Access" (Offline Mode).
*   **Dashboard**: Real-time stats (Sent, Scheduled, Failed) with 3D aesthetic cards.
*   **Offline Mode**: Smart fallback to `MockService` when backend is unreachable.
*   **Compose**: Interface to create campaigns (UI mocked for demo).
*   **Tables**: List views for scheduled vs. sent emails.

---

## ☁️ Deployment
For live deployment instructions (Vercel + Railway), see [DEPLOYMENT.md](./DEPLOYMENT.md).
