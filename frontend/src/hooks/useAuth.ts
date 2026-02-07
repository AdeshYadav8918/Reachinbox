import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { MockService } from '../services/MockService';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const isGuest = localStorage.getItem('isGuest');
        if (isGuest === 'true') {
            setUser(MockService.getUser());
            setLoading(false);
            return;
        }

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

    const loginAsGuest = () => {
        const guestUser = MockService.getUser();
        setUser(guestUser);
        localStorage.setItem('isGuest', 'true');
    };

    const logout = async () => {
        localStorage.removeItem('isGuest');
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    return { user, loading, logout, loginAsGuest };
};
