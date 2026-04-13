import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleImportSubscription from '../../../utils/Helpers/handleImportSubscription.js';
import createCalendarSubscription from '../../../utils/Api/createCalendarSubscription.js';

vi.mock('../../../utils/Api/createCalendarSubscription.js', () => ({
    default: vi.fn()
}));

describe('handleImportSubscription', () => {
    let setSubscriptions;
    let setError;
    let refetchBlocks;

    beforeEach(() => {
        vi.clearAllMocks();

        setSubscriptions = vi.fn();
        setError = vi.fn();
        refetchBlocks = vi.fn();
    });

    it('clears errors, prepends the new subscription, and refetches blocks', async () => {
        const payload = {
            name: 'My Timetable',
            sourceUrl: 'https://example.com/feed.ics'
        };

        const mockSubscription = {
            id: 1,
            name: 'My Timetable',
            source_url: 'https://example.com/feed.ics'
        };

        createCalendarSubscription.mockResolvedValue({
            subscription: mockSubscription
        });

        await handleImportSubscription(payload, {
            setSubscriptions,
            setError,
            refetchBlocks
        });

        expect(setError).toHaveBeenCalledWith('');
        expect(createCalendarSubscription).toHaveBeenCalledWith(payload);
        expect(setSubscriptions).toHaveBeenCalledTimes(1);
        expect(refetchBlocks).toHaveBeenCalledTimes(1);

        const updateFn = setSubscriptions.mock.calls[0][0];
        const result = updateFn([{ id: 2, name: 'Existing' }]);

        expect(result).toEqual([
            mockSubscription,
            { id: 2, name: 'Existing' }
        ]);
    });

    it('uses the source_url error message when present', async () => {
        createCalendarSubscription.mockRejectedValue({
            response: {
                data: {
                    source_url: ['Invalid ICS URL.']
                }
            }
        });

        await handleImportSubscription(
            { name: 'My Timetable', sourceUrl: 'bad-url' },
            { setSubscriptions, setError, refetchBlocks }
        );

        expect(setError).toHaveBeenLastCalledWith('Invalid ICS URL.');
        expect(setSubscriptions).not.toHaveBeenCalled();
        expect(refetchBlocks).not.toHaveBeenCalled();
    });

    it('falls back to the generic import error message when no backend detail exists', async () => {
        createCalendarSubscription.mockRejectedValue(new Error('Unknown error'));

        await handleImportSubscription(
            { name: 'My Timetable', sourceUrl: 'bad-url' },
            { setSubscriptions, setError, refetchBlocks }
        );

        expect(setError).toHaveBeenLastCalledWith(
            'Failed to import timetable'
        );
    });
});