# ReachInbox Full-Stack Email Scheduler

A production-grade email scheduling system built with Node.js, Express, BullMQ, Redis, and React. Designed for high throughput, reliability, and fault tolerance.

## 🚀 Features

### Backend
-   **Reliable Scheduling**: Uses **BullMQ** (Redis-backed) for delayed jobs. No cron jobs used.
-   **Persistence**: Mysql database stores all campaign and email states. System survives restarts without losing jobs.
-   **Concurrency Control**: Configurable worker concurrency to handle multiple jobs in parallel.
-   **Rate Limiting**:
    -   **Hourly Limits**: Enforced per-user via Redis counters.
    -   **Throttling**: Configurable delay between individual emails (e.g. 2 seconds) to mimic real-world provider limits.
    -   **Smart Rescheduling**: If a limit is hit, jobs are automatically rescheduled to the next available window.
-   **Idempotency**: Prevents duplicate sends using Redis locks and database status checks.
-   **Fault Tolerance**: separate Worker process that can run independently from the API server.

### Frontend
-   **Dashboard**: View scheduled and sent email statistics.
-   **Campaign Creation**: Compose emails and upload CSV recipient lists.
-   **Google Login**: Real OAuth authentication.
-   **Resilience**:
    -   **Offline Mode**: Frontend detects if the backend is unreachable and serves mock data for demonstration (Vercel deployment compatible).
    -   **Graceful Failure**: attempting to schedule without a backend clearly notifies the user.

---

## 🛠️ Tech Stack

-   **Backend**: TypeScript, Express.js, BullMQ, Redis, MySQL, Ethereal Email (SMTP).
-   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion.
-   **Infrastructure**: Docker (for Redis/MySQL).

---

## ⚙️ Setup & Installation

### Prerequisites
-   Node.js (v18+)
-   Docker & Docker Compose (recommended)
-   Google OAuth Client ID (for login)

### 1. clone the repository
```bash
git clone https://github.com/yourusername/reachinbox-assignment.git
cd reachinbox-assignment
```

### 2. Infrastructure (Redis + MySQL)
Run the docker-compose file to start Redis and MySQL:
```bash
docker-compose up -d
```
*Alternatively, use managed services and update `.env` accordingly.*

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
**Configure `.env`:**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=reachinbox
REDIS_HOST=localhost
REDIS_PORT=6379
# Ethereal Email (Auto-generated if left blank, check logs)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
# Rate Limiting
MAX_EMAILS_PER_HOUR=100
MIN_DELAY_BETWEEN_EMAILS_MS=2000
WORKER_CONCURRENCY=5
# Google Auth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=http://localhost:5173
```

**Run Migration & Server:**
```bash
npm run migrate # Setup DB schema
npm run dev     # Starts API + Worker
```

### 4. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
```
**Configure `.env`:**
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=...
```

**Run Frontend:**
```bash
npm run dev
```
Visit `http://localhost:5173`

---

## 🏗️ Architecture Overview

### Scheduling Flow
1.  **User Request**: User submits a campaign via Frontend.
2.  **API Layer**: `POST /api/campaigns` validates input and creates DB records (`status: pending`).
3.  **Job Creation**: For each recipient, a **BullMQ Delayed Job** is added to Redis.
    -   *Delay* = `scheduled_time` - `now`.
    -   *Job ID* is stored in DB for tracking.
4.  **Worker Processing**:
    -   Worker picks up job when delay expires.
    -   **Lock**: Acquires Redis lock for the specific email ID (Idempotency).
    -   **Check**: Verifies DB status is not 'sent'.
    -   **Rate Limit**: Checks user's hourly usage in Redis.
        -   *If Exceeded*: Calculates time to next hour, reschedules job, and throws special error to release job.
    -   **Send**: Sends email via SMTP (Ethereal).
    -   **Update**: Marks DB as `sent`, increments counters.

### Vercel / Offline Demo Mode
To ensure the project is viewable publicly even if the backend is sleeping (e.g. on free tier hosting):
-   The Frontend includes an **API Interceptor**.
-   If backend requests fail (Network Error), it returns **Mock Data** for read-only endpoints (Dashboard stats, Email lists).
-   This allows the Dashboard to render beautifully on Vercel immediately.
-   **Write operations** (Scheduling) correctly report failure if backend is down.

---

## ✅ API Endpoints

-   `GET /auth/google`: Initiate OAuth
-   `POST /api/campaigns`: Create new campaign
-   `GET /api/campaigns/stats`: Dashboard statistics
-   `GET /api/campaigns/emails/scheduled`: List scheduled emails
-   `GET /api/campaigns/emails/sent`: List sent history
