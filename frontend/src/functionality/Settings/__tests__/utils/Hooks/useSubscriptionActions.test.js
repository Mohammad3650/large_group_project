import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useSubscriptionActions from '../../../utils/Hooks/useSubscriptionActions.js';
import handleImportSubscription from '../../../utils/Helpers/handleImportSubscription.js';
import handleRefreshSubscription from '../../../utils/Helpers/handleRefreshSubscription.js';
import handleDeleteSubscription from '../../../utils/Helpers/handleDeleteSubscription.js';

vi.mock('../../../utils/Helpers/handleImportSubscription.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../utils/Helpers/handleRefreshSubscription.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../utils/Helpers/handleDeleteSubscription.js', () => ({
    default: vi.fn()
}));

describe('useSubscriptionActions', () => {
    let context;

    beforeEach(() => {
        vi.clearAllMocks();

        context = {
            setSubscriptions: vi.fn(),
            setError: vi.fn(),
            refetchBlocks: vi.fn()
        };
    });

    it('returns import, refresh, and delete handlers', () => {
        const { result } = renderHook(() => useSubscriptionActions(context));

        expect(result.current.onImport).toBeTypeOf('function');
        expect(result.current.onRefresh).toBeTypeOf('function');
        expect(result.current.onDelete).toBeTypeOf('function');
    });

    it('calls handleImportSubscription with payload and action context', () => {
        const payload = {
            name: 'My Timetable',
            sourceUrl: 'https://example.com/feed.ics'
        };

        const { result } = renderHook(() => useSubscriptionActions(context));
        result.current.onImport(payload);

        expect(handleImportSubscription).toHaveBeenCalledWith(payload, context);
    });

    it('calls handleRefreshSubscription with subscription id and action context', () => {
        const { result } = renderHook(() => useSubscriptionActions(context));
        result.current.onRefresh(42);

        expect(handleRefreshSubscription).toHaveBeenCalledWith(42, context);
    });

    it('calls handleDeleteSubscription with subscription id and action context', () => {
        const { result } = renderHook(() => useSubscriptionActions(context));
        result.current.onDelete(42);

        expect(handleDeleteSubscription).toHaveBeenCalledWith(42, context);
    });
});