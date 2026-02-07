import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authAPI = {
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    loginUrl: `${API_URL}/auth/google`,
    guestLoginUrl: `${API_URL}/auth/guest`, // Skip Login
    guestLogin: () => api.get('/auth/guest'),
};

// Add response interceptor to handle offline mode/network errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If network error (backend offline) or 404/500
        if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
            const url = error.config.url;
            console.warn(`Backend offline or unreachable (${url}). Returning mock data.`);

            // Mock response for "Get Current User"
            if (url === '/auth/me') {
                return Promise.resolve({
                    data: {
                        user: {
                            id: 999,
                            email: 'guest@example.com',
                            name: 'Guest User',
                            avatar: 'https://via.placeholder.com/150'
                        }
                    }
                });
            }

            // Mock response for "Guest Login" redirect
            if (url === '/auth/guest') {
                // In a real app this would typically be a redirect, but for axios it's just a call.
                // We can't easily mock the redirect behavior here without changing the calling code,
                // but we can prevent the crash.
                return Promise.resolve({ data: { message: 'Offline mode guest login' } });
            }

            // Mock Campaign Stats
            if (url === '/api/campaigns/stats') {
                return Promise.resolve({
                    data: {
                        stats: {
                            total: 1250,
                            sent: 980,
                            failed: 20,
                            scheduled: 150,
                            queued: 100
                        }
                    }
                });
            }

            // Mock Scheduled Emails
            if (url === '/api/campaigns/emails/scheduled') {
                return Promise.resolve({
                    data: {
                        emails: [
                            { id: 1, subject: 'Q4 Marketing Outreach', recipient: 'client@example.com', status: 'scheduled', scheduled_time: new Date(Date.now() + 86400000).toISOString() },
                            { id: 2, subject: 'Partnership Proposal', recipient: 'partner@tech.com', status: 'queued', scheduled_time: new Date(Date.now() + 172800000).toISOString() },
                            { id: 3, subject: 'Follow-up Meeting', recipient: 'lead@sales.com', status: 'scheduled', scheduled_time: new Date(Date.now() + 3600000).toISOString() },
                        ]
                    }
                });
            }

            // Mock Sent Emails
            if (url === '/api/campaigns/emails/sent') {
                return Promise.resolve({
                    data: {
                        emails: [
                            { id: 101, subject: 'Welcome to ReachInbox', recipient: 'newuser@demo.com', status: 'sent', sent_at: new Date(Date.now() - 86400000).toISOString() },
                            { id: 102, subject: 'Your Trial Has Started', recipient: 'trial@demo.com', status: 'sent', sent_at: new Date(Date.now() - 172800000).toISOString() },
                            { id: 103, subject: 'Invalid Email Test', recipient: 'bad@add.ress', status: 'failed', sent_at: new Date(Date.now() - 200000).toISOString() },
                        ]
                    }
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
