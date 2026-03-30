import { describe, it, expect, vi, beforeEach } from 'vitest';
import refreshCalendarSubscription from '../refreshCalendarSubscription.js';
import { api } from '../../api.js';

vi.mock('../../api.js', () => ({
    api: {
        post: vi.fn()
    }
}));

describe('Tests for refreshCalendarSubscription', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the correct refresh endpoint and returns response data', async () => {
        const mockData = {
            subscription: {
                id: 7,
                name: 'KCL Timetable'
            },
            message: 'Calendar subscription refreshed successfully.'
        };

        api.post.mockResolvedValue({ data: mockData });

        const result = await refreshCalendarSubscription(7);

        expect(api.post).toHaveBeenCalledTimes(1);
        expect(api.post).toHaveBeenCalledWith(
            '/api/calendar-subscriptions/7/refresh/'
        );
        expect(result).toEqual(mockData);
    });

    it('propagates API errors', async () => {
        const mockError = new Error('Refresh failed');
        api.post.mockRejectedValue(mockError);

        await expect(refreshCalendarSubscription(7)).rejects.toThrow(
            'Refresh failed'
        );
    });
});