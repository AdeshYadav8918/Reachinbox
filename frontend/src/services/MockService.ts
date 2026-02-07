import type { User } from '../../../backend/src/types';

export const MockService = {
    getUser: (): User => ({
        id: 999,
        name: 'Guest User',
        email: 'guest@example.com',
        avatar: '', // Empty to test initial fallback
        google_id: 'mock-google-id',
        created_at: new Date(),
        updated_at: new Date(),
    }),

    getCampaignStats: () => ({
        total: 125,
        sent: 80,
        failed: 5,
        scheduled: 30,
        queued: 10,
        pending: 40 // sum of scheduled + queued
    }),

    getScheduledEmails: () => Array.from({ length: 5 }).map((_, i) => ({
        id: `mock-s-${i}`,
        recipient: `scheduled${i + 1}@example.com`,
        subject: `Mock Scheduled Email ${i + 1}`,
        body: 'This is a mock email body for offline mode verification.',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 86400000 * (i + 1)).toISOString(),
    })),

    getSentEmails: () => Array.from({ length: 8 }).map((_, i) => ({
        id: `mock-sent-${i}`,
        recipient: `sent${i + 1}@example.com`,
        subject: `Mock Sent Email ${i + 1}`,
        body: 'This is a mock email body for offline mode verification.',
        status: 'sent',
        sentAt: new Date(Date.now() - 86400000 * (i + 1)).toISOString(),
    })),
};
