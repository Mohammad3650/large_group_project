import { describe, it, expect, vi, beforeEach } from 'vitest';
import refreshCalendarSubscription from '../../../utils/Api/refreshCalendarSubscription.js';
import { api } from '../../../../../api.js';

vi.mock('../../../../../api.js', () => ({
    api: {
        post: vi.fn()
    }
}));

describe('refreshCalendarSubscription', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the correct endpoint and returns response data', async () => {
        const mockData = {
            subscription: {
                id: 42,
                name: 'Updated Timetable',
                source_url: 'https://example.com/feed.ics'
            }
        };

        api.post.mockResolvedValue({ data: mockData });

        const result = await refreshCalendarSubscription(42);

        expect(api.post).toHaveBeenCalledWith(
            '/api/calendar-subscriptions/42/refresh/'
        );
        expect(result).toEqual(mockData);
    });

    it('propagates API errors', async () => {
        const mockError = new Error('Refresh failed');
        api.post.mockRejectedValue(mockError);

        await expect(refreshCalendarSubscription(42)).rejects.toThrow(
            'Refresh failed'
        );
    });
});