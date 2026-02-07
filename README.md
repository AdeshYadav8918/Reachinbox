# ReachInbox Internship Assignment

This repository contains the full-stack implementation for the ReachInbox Email Scheduling system. It is designed to handle high-throughput email sending using a distributed queue architecture.

## 🏗 System Architecture

The project is split into two distinct services:

1.  **Backend (`/backend`)**: A Node.js/Express service that handles API requests, manages the MySQL database, and produces jobs for the Redis queue.
2.  **Frontend (`/frontend`)**: A React/Vite application that provides the user interface for scheduling and monitoring campaigns.

### Key Implementation Details

*   **Queue System**: I chose **BullMQ** over native Redis commands or other libraries because of its robust handling of delayed jobs and automatic retries. The queue is named `email-queue`.
*   **Worker Concurrency**: The worker is configured (via `WORKER_CONCURRENCY` env) to process multiple emails in parallel, utilizing the Node.js event loop efficiently.
*   **Rate Limiting Strategy**: Instead of a simple counter, I implemented a **Token Bucket** variation using Redis keys with a TTL (Time-To-Live) of 1 hour. If a user exceeds their limit, the job is not dropped but re-queued with a delay calculated to land in the next hour window.
*   **Database Schema**:
    *   `users`: Stores OAuth profiles.
    *   `email_campaigns`: Tracks the overall state of a bulk send.
    *   `scheduled_emails`: Individual email status tracking (pending -> queued -> sent/failed).
    *   `rate_limit_tracking`: Persisted logs of usage.

## 🚀 Getting Started

### Prerequisites

*   Docker (for Redis and MySQL)
*   Node.js v18+

### Step 1: Infrastructure

Launch the required services using Docker Compose:

```bash
docker-compose up -d
```

This will start MySQL on port `3306` and Redis on port `6379`.

### Step 2: Backend Configuration

Navigate to the backend and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file (copied from `.env.example`) and configure your Google OAuth credentials.

**Database Migration:**
I've included a custom migration script to set up the schema:

```bash
npm run migrate
```

**Run the Services:**
You need two terminals for the backend:

1.  **API Server**: `npm run dev`
2.  **Queue Worker**: `npm run worker`

### Step 3: Frontend Configuration

Navigate to the frontend:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🛡️ Authentication & Skip Login

For development purposes, I implemented a **"Skip Login"** feature.
*   **Production**: Uses Google OAuth 2.0.
*   **Development**: You can bypass Google Auth by clicking "Skip Login" on the login page. This creates a guest session, allowing you to test the scheduler without valid Google credentials.

## 🧪 Testing the Scheduler

1.  Log in to the dashboard.
2.  Click **"Compose New Email"**.
3.  Upload a CSV file (format: one email per line) or manually enter emails.
4.  Set a **high delay** (e.g., 5000ms) to observe the "Scheduled" status in the dashboard before it changes to "Sent".
5.  To test **Rate Limiting**, set the "Hourly Limit" to a low number (e.g., 5) and schedule 10 emails. You will see the excess emails automatically rescheduled for the next hour.
