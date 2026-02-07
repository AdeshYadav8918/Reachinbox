import React, { useState } from 'react';
import api from '../services/api';
import { X, Upload, Calendar, Clock, Zap, Mail, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [recipients, setRecipients] = useState<string[]>([]);
    const [startTime, setStartTime] = useState('');
    const [delay, setDelay] = useState(2000);
    const [hourlyLimit, setHourlyLimit] = useState(100);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                const emails = text
                    .split(/[\n,]/)
                    .map((e) => e.trim())
                    .filter((e) => e && e.includes('@'));
                setRecipients(emails);
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/api/campaigns', {
                subject,
                body,
                recipients,
                start_time: new Date(startTime).toISOString(),
                delay_between_emails_ms: delay,
                hourly_limit: hourlyLimit,
            });
            onSuccess();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message
                || (err.response?.data?.errors && err.response.data.errors[0]?.msg)
                || 'Failed to schedule campaign';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                            onClick={onClose}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Campaign</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Schedule a new email blast</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[70vh] overflow-y-auto">
                                {error && (
                                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                        <div className="w-1 h-4 bg-red-400 rounded-full"></div>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        {/* Subject */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" /> Subject Line
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all outline-none"
                                                placeholder="Enter a catchy subject..."
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                            />
                                        </div>

                                        {/* Body */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" /> Email Content
                                            </label>
                                            <textarea
                                                required
                                                rows={5}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all outline-none resize-none"
                                                placeholder="Write your message here..."
                                                value={body}
                                                onChange={(e) => setBody(e.target.value)}
                                            />
                                        </div>

                                        {/* Recipients */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Upload className="w-4 h-4 text-gray-400" /> Recipients (CSV)
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept=".csv,.txt"
                                                    onChange={handleFileUpload}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 transition-all cursor-pointer"
                                                />
                                            </div>
                                            {recipients.length > 0 && (
                                                <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5 mt-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    {recipients.length} recipients loaded
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" /> Start Time
                                            </label>
                                            <input
                                                type="datetime-local"
                                                required
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none text-sm"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" /> Delay (ms)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none text-sm"
                                                value={delay}
                                                onChange={(e) => setDelay(parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-gray-400" /> Hourly Limit
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none text-sm"
                                                value={hourlyLimit}
                                                onChange={(e) => setHourlyLimit(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || recipients.length === 0}
                                            className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {loading ? 'Scheduling...' : 'Launch Campaign'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};
