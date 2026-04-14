import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useSubscriptions from '../../../utils/Hooks/useSubscriptions.js';
import getCalendarSubscriptions from '../../../utils/Api/getCalendarSubscriptions.js';

vi.mock('../../../utils/Api/getCalendarSubscriptions.js', () => ({
    default: vi.fn()
}));

describe('useSubscriptions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads subscriptions successfully', async () => {
        const setError = vi.fn();
        const mockSubscriptions = [
            {
                id: 1,
                name: 'Timetable',
                source_url: 'https://example.com/feed.ics'
            }
        ];

        getCalendarSubscriptions.mockResolvedValue(mockSubscriptions);

        const { result } = renderHook(() => useSubscriptions(setError));

        await waitFor(() => {
            expect(result.current.subscriptions).toEqual(mockSubscriptions);
        });

        expect(setError).not.toHaveBeenCalled();
    });

    it('sets the load error message when fetching fails', async () => {
        const setError = vi.fn();

        getCalendarSubscriptions.mockRejectedValue(new Error('Fetch failed'));

        renderHook(() => useSubscriptions(setError));

        await waitFor(() => {
            expect(setError).toHaveBeenCalledWith(
                'Failed to load calendar subscriptions'
            );
        });
    });

    it('returns setSubscriptions so callers can update subscriptions manually', async () => {
    const setError = vi.fn();
    getCalendarSubscriptions.mockResolvedValue([]);

    const { result } = renderHook(() => useSubscriptions(setError));

    await waitFor(() => {
        expect(result.current.setSubscriptions).toBeTypeOf('function');
    });
    });
});