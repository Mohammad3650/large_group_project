import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleDeleteSubscription from '../../../utils/Helpers/handleDeleteSubscription.js';
import deleteCalendarSubscription from '../../../utils/Api/deleteCalendarSubscription.js';

vi.mock('../../../utils/Api/deleteCalendarSubscription.js', () => ({
    default: vi.fn()
}));

describe('handleDeleteSubscription', () => {
    let setSubscriptions;
    let setError;
    let refetchBlocks;

    beforeEach(() => {
        vi.clearAllMocks();

        setSubscriptions = vi.fn();
        setError = vi.fn();
        refetchBlocks = vi.fn();
    });

    it('clears errors, removes the matching subscription, and refetches blocks', async () => {
        deleteCalendarSubscription.mockResolvedValue(undefined);

        await handleDeleteSubscription(42, {
            setSubscriptions,
            setError,
            refetchBlocks
        });

        expect(setError).toHaveBeenCalledWith('');
        expect(deleteCalendarSubscription).toHaveBeenCalledWith(42);
        expect(setSubscriptions).toHaveBeenCalledTimes(1);
        expect(refetchBlocks).toHaveBeenCalledTimes(1);

        const updateFn = setSubscriptions.mock.calls[0][0];
        const result = updateFn([
            { id: 42, name: 'Delete me' },
            { id: 7, name: 'Keep me' }
        ]);

        expect(result).toEqual([{ id: 7, name: 'Keep me' }]);
    });

    it('sets the delete error message when the request fails', async () => {
        deleteCalendarSubscription.mockRejectedValue(
            new Error('Delete failed')
        );

        await handleDeleteSubscription(42, {
            setSubscriptions,
            setError,
            refetchBlocks
        });

        expect(setError).toHaveBeenLastCalledWith(
            'Failed to delete timetable subscription'
        );
        expect(setSubscriptions).not.toHaveBeenCalled();
        expect(refetchBlocks).not.toHaveBeenCalled();
    });
});