import { describe, it, expect, vi, beforeEach } from 'vitest';
import getCalendarSubscriptions from '../Api/getCalendarSubscriptions.js';
import { api } from '../../api.js';

vi.mock('../../api.js', () => ({
    api: {
        get: vi.fn()
    }
}));

describe('getCalendarSubscriptions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the correct endpoint and returns subscription data', async () => {
        const mockData = [
            {
                id: 1,
                name: 'KCL Timetable',
                source_url: 'https://example.com/calendar.ics'
            },
            {
                id: 2,
                name: 'Personal Calendar',
                source_url: 'https://example.com/personal.ics'
            }
        ];

        api.get.mockResolvedValue({ data: mockData });

        const result = await getCalendarSubscriptions();

        expect(api.get).toHaveBeenCalledTimes(1);
        expect(api.get).toHaveBeenCalledWith('/api/calendar-subscriptions/');
        expect(result).toEqual(mockData);
    });

    it('propagates API errors', async () => {
        const mockError = new Error('Fetch failed');
        api.get.mockRejectedValue(mockError);

        await expect(getCalendarSubscriptions()).rejects.toThrow('Fetch failed');
    });
});