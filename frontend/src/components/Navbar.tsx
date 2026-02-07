import React from 'react';
import { LogOut, Home, Mail, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

interface NavbarProps {
    activeTab: 'scheduled' | 'sent';
    setActiveTab: (tab: 'scheduled' | 'sent') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();

    return (
        <div className="h-screen w-20 lg:w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-white/[0.1] flex flex-col fixed left-0 top-0 overflow-y-auto transition-colors duration-200">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white hidden lg:block tracking-tight">ReachInbox</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-4 space-y-1">
                <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'scheduled'
                        ? 'bg-indigo-50 dark:bg-white/[0.1] text-indigo-600 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <Home className="h-5 w-5" />
                    <span className="hidden lg:block">Scheduled</span>
                    {activeTab === 'scheduled' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full"
                        />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('sent')}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'sent'
                        ? 'bg-indigo-50 dark:bg-white/[0.1] text-indigo-600 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <FileText className="h-5 w-5" />
                    <span className="hidden lg:block">Sent History</span>
                </button>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-100 dark:border-white/[0.1]">
                <div className="flex items-center gap-3 mb-4 px-2">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm" />
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                            {user?.name?.[0]}
                        </div>
                    )}
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center lg:justify-start gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:block">Logout</span>
                </button>
            </div>
        </div>
    );
};
