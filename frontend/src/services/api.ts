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
                            email: 'offline_user@demo.com',
                            name: 'Demo User (Offline)',
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
        }
        return Promise.reject(error);
    }
);

export default api;
