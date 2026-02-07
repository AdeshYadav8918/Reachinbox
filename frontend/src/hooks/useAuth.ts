import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authAPI.getCurrentUser()
            .then(res => {
                setUser(res.data.user);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return { user, loading, logout };
};
