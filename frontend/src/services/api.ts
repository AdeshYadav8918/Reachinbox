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
};

export default api;
