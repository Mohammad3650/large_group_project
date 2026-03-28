import { describe, it, expect, vi, beforeEach } from 'vitest';
import createCalendarSubscription from '../createCalendarSubscription.js';
import { api } from '../../api.js';

vi.mock('../../api.js', () => ({
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
                name: 'KCL Timetable',
                source_url: 'https://example.com/calendar.ics'
            },
            message: 'Calendar subscription imported successfully.'
        };

        api.post.mockResolvedValue({ data: mockData });

        const result = await createCalendarSubscription({
            name: 'KCL Timetable',
            sourceUrl: 'https://example.com/calendar.ics'
        });

        expect(api.post).toHaveBeenCalledTimes(1);
        expect(api.post).toHaveBeenCalledWith(
            '/api/calendar-subscriptions/',
            {
                name: 'KCL Timetable',
                source_url: 'https://example.com/calendar.ics'
            }
        );
        expect(result).toEqual(mockData);
    });

    it('propagates API errors', async () => {
        const mockError = new Error('Request failed');
        api.post.mockRejectedValue(mockError);

        await expect(
            createCalendarSubscription({
                name: 'KCL Timetable',
                sourceUrl: 'https://example.com/calendar.ics'
            })
        ).rejects.toThrow('Request failed');
    });
});