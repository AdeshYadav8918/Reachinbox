# Reachinbox Assignment - Email Scheduling & Analytics Platform

This is a full-stack application built for the Reachinbox assignment. It features an email scheduling backend and a responsive frontend dashboard with analytics.

## 🚀 Features

### Core Functionality
-   **Google Login**: Secure authentication using Google OAuth.
-   **Email Scheduling**: Schedule emails to be sent at specific times.
-   **Analytics Dashboard**: View aggregate statistics for scheduled, sent, and failed emails.
-   **3D UI Components**: Modern, aesthetic interface using Aceternity UI components.

### 🌟 New: Offline / Mock Mode
A robust offline mode has been implemented for resilience:
-   **Backend-Independent**: The frontend works even if the backend is down.
-   **Guest Access**: A "Skip Login" button allows immediate access to the dashboard using mock data.
-   **Mock Data Provider**: Simulated email lists and statistics are served when the API is unreachable.
-   **Smart Fallback**: The app automatically detects network errors and switches to mock data without crashing.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion.
-   **Backend**: Node.js, Express, MySQL, Redis (BullMQ for job queues).
-   **Database**: MySQL (via Docker).
-   **Queue**: Redis (via Docker).

## 🏃‍♂️ Getting Started

### Prerequisites
-   Node.js (v18+)
-   Docker Desktop (for MySQL and Redis)

### 1. Setup Environment
Ensure your `.env` file in `backend/` has the following:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=reachinbox_db
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:5173
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass
```

### 2. Start Infrastructure
Run the following command in the root directory to start MySQL and Redis:
```bash
docker-compose up -d
```

### 3. Run Backend
```bash
cd backend
npm install
npm run dev
```
*Server runs on port 3000*

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on http://localhost:5173 (or 5177 if port is busy)*

## 🧪 Testing Offline Mode
1.  Stop the backend server (Ctrl+C).
2.  Open the frontend URL.
3.  You will be redirected to the Login page.
4.  Click **"Guest Access (Skip Login)"**.
5.  The dashboard will load with sample data, demonstrating the resilience feature.
