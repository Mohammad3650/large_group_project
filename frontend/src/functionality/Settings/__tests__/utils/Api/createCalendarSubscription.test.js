import { describe, it, expect, vi, beforeEach } from 'vitest';
import createCalendarSubscription from '../../../utils/Api/createCalendarSubscription.js';
import { api } from '../../../../../api.js';

vi.mock('../../../../../api.js', () => ({
    api: {
        post: vi.fn()
    }
}));

describe('createCalendarSubscription', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('posts the correct payload and returns response data', async () => {
        const mockData = {
            subscription: {
                id: 1,
                name: 'My Timetable',
                source_url: 'https://example.com/feed.ics'
            }
        };

        api.post.mockResolvedValue({ data: mockData });

        const result = await createCalendarSubscription({
            name: 'My Timetable',
            sourceUrl: 'https://example.com/feed.ics'
        });

        expect(api.post).toHaveBeenCalledWith('/api/calendar-subscriptions/', {
            name: 'My Timetable',
            source_url: 'https://example.com/feed.ics'
        });

        expect(result).toEqual(mockData);
    });

    it('propagates API errors', async () => {
        const mockError = new Error('Request failed');
        api.post.mockRejectedValue(mockError);

        await expect(
            createCalendarSubscription({
                name: 'My Timetable',
                sourceUrl: 'https://example.com/feed.ics'
            })
        ).rejects.toThrow('Request failed');
    });
});