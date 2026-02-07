# ReachInbox Frontend

This is the frontend application for the ReachInbox Email Scheduler, built with:

*   **React** (v18)
*   **TypeScript**
*   **Vite**
*   **Tailwind CSS**

## 🚀 Getting Started

### Prerequisites

*   Node.js v18+
*   The backend server running on `http://localhost:3000`

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📁 Project Structure

*   `src/components`: UI components (Dashboard, Auth, etc.)
*   `src/services`: API integration logic (`api.ts`).
*   `src/hooks`: Custom React hooks.
*   `src/types`: TypeScript interfaces.

## 🔑 Authentication

The frontend supports two modes:
1.  **Google OAuth**: Redirects to the backend for authentication.
2.  **Skip Login**: A development-only mode to bypass authentication.

## 🎨 Styling

Styling is handled via **Tailwind CSS**. Configuration can be found in `tailwind.config.js`.
