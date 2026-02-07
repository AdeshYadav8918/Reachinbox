import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { MockService } from '../services/MockService';

interface AuthContextType {
    user: any;
    loading: boolean;
    loginAsGuest: () => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing guest session (optional, kept for resilience if desired, but user removed persistence requirement)
        // For strict "always login first" flow, we skip local storage check on mount.

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
        // We do NOT persist to localStorage to ensure refresh goes to login page as requested.
        // If persistence is needed later, uncomment: localStorage.setItem('isGuest', 'true');
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
