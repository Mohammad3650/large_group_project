import { api } from '../../api.js';
import refreshCalendarSubscription from '../Api/refreshCalendarSubscription.js';

vi.mock('../../api.js', () => ({
    api: {
        post: vi.fn()
    }
}));

describe('Tests for refreshCalendarSubscription', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('posts to the refresh subscription endpoint and returns response data', async () => {
        const mockResponseData = {
            subscription: { id: 5, name: 'KCL Timetable' },
            sync_result: { created: 1, updated: 0, skipped: 0 }
        };

        api.post.mockResolvedValue({
            data: mockResponseData
        });

        const result = await refreshCalendarSubscription(5);

        expect(api.post).toHaveBeenCalledWith(
            '/api/calendar-subscriptions/5/refresh/'
        );
        expect(result).toEqual(mockResponseData);
    });
});