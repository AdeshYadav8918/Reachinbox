import React from 'react';
import { Mail, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Email {
    id: number;
    recipient_email: string;
    subject: string;
    scheduled_time?: string;
    sent_at?: string;
    status: string;
}

interface EmailTableProps {
    emails: Email[];
    type: 'scheduled' | 'sent';
    loading: boolean;
}

export const EmailTable: React.FC<EmailTableProps> = ({ emails, type, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading emails...</p>
            </div>
        );
    }

    if (emails.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Mail className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No emails found</h3>
                <p className="text-gray-500 mt-1 max-w-sm">
                    {type === 'scheduled'
                        ? "You haven't scheduled any emails yet. Start a new campaign!"
                        : "No sent history available yet."}
                </p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                    </span>
                );
            case 'queued':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                        <Clock className="w-3.5 h-3.5" /> Queued
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Clock className="w-3.5 h-3.5" /> Scheduled
                    </span>
                );
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Recipient
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Subject
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {type === 'scheduled' ? 'Scheduled For' : 'Sent At'}
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {emails.map((email, index) => (
                        <motion.tr
                            key={email.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50/50 transition-colors"
                        >
                            <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase border border-indigo-50">
                                        {email.recipient_email[0]}
                                    </div>
                                    {email.recipient_email}
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                                {email.subject}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                                {new Date(type === 'scheduled' ? email.scheduled_time! : email.sent_at!).toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                {getStatusBadge(email.status)}
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
