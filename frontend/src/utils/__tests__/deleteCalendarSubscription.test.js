import { describe, it, expect, vi, beforeEach } from 'vitest';
import deleteCalendarSubscription from '../deleteCalendarSubscription.js';
import { api } from '../../api.js';

vi.mock('../../api.js', () => ({
    api: {
        delete: vi.fn()
    }
}));

describe('deleteCalendarSubscription', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls the correct endpoint and returns response data', async () => {
        const mockData = {
            message: 'Calendar subscription deleted successfully.'
        };

        api.delete.mockResolvedValue({ data: mockData });

        const result = await deleteCalendarSubscription(42);

        expect(api.delete).toHaveBeenCalledTimes(1);
        expect(api.delete).toHaveBeenCalledWith(
            '/api/calendar-subscriptions/42/'
        );
        expect(result).toEqual(mockData);
    });

    it('propagates API errors', async () => {
        const mockError = new Error('Delete failed');
        api.delete.mockRejectedValue(mockError);

        await expect(deleteCalendarSubscription(42)).rejects.toThrow(
            'Delete failed'
        );
    });
});