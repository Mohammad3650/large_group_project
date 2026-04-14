import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleRefreshSubscription from '../../../utils/Helpers/handleRefreshSubscription.js';
import refreshCalendarSubscription from '../../../utils/Api/refreshCalendarSubscription.js';

vi.mock('../../../utils/Api/refreshCalendarSubscription.js', () => ({
    default: vi.fn()
}));

describe('handleRefreshSubscription', () => {
    let setSubscriptions;
    let setError;
    let refetchBlocks;

    beforeEach(() => {
        vi.clearAllMocks();

        setSubscriptions = vi.fn();
        setError = vi.fn();
        refetchBlocks = vi.fn();
    });

    it('clears errors, updates the matching subscription, and refetches blocks', async () => {
        const updatedSubscription = {
            id: 42,
            name: 'Updated Timetable',
            source_url: 'https://example.com/feed.ics'
        };

        refreshCalendarSubscription.mockResolvedValue({
            subscription: updatedSubscription
        });

        await handleRefreshSubscription(42, {
            setSubscriptions,
            setError,
            refetchBlocks
        });

        expect(setError).toHaveBeenCalledWith('');
        expect(refreshCalendarSubscription).toHaveBeenCalledWith(42);
        expect(setSubscriptions).toHaveBeenCalledTimes(1);
        expect(refetchBlocks).toHaveBeenCalledTimes(1);

        const updateFn = setSubscriptions.mock.calls[0][0];
        const result = updateFn([
            { id: 42, name: 'Old Timetable' },
            { id: 7, name: 'Other Timetable' }
        ]);

        expect(result).toEqual([
            updatedSubscription,
            { id: 7, name: 'Other Timetable' }
        ]);
    });

    it('sets the refresh error message when the request fails', async () => {
        refreshCalendarSubscription.mockRejectedValue(
            new Error('Refresh failed')
        );

        await handleRefreshSubscription(42, {
            setSubscriptions,
            setError,
            refetchBlocks
        });

        expect(setError).toHaveBeenLastCalledWith(
            'Failed to refresh timetable subscription'
        );
        expect(setSubscriptions).not.toHaveBeenCalled();
        expect(refetchBlocks).not.toHaveBeenCalled();
    });
});