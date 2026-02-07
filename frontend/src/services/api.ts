import axios from 'axios';
import { MockService } from './MockService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check for network error or server error (backend down)
        if (error.code === 'ERR_NETWORK' || (error.response && error.response.status >= 500)) {
            console.warn('Backend unreachable, returning mock data for:', error.config.url);

            const url = error.config.url;

            if (url.includes('/auth/google')) {
                // For auth check, we let useAuth handle the fallback
                return Promise.reject(error);
            }

            if (url.includes('/api/campaigns/stats')) {
                return Promise.resolve({ data: { stats: MockService.getCampaignStats() } });
            }

            if (url.includes('/api/campaigns/emails/scheduled')) {
                return Promise.resolve({ data: { emails: MockService.getScheduledEmails() } });
            }

            if (url.includes('/api/campaigns/emails/sent')) {
                return Promise.resolve({ data: { emails: MockService.getSentEmails() } });
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    loginUrl: `${API_URL}/auth/google`,
    guestLoginUrl: `${API_URL}/auth/guest`, // Skip Login
};

export default api;
