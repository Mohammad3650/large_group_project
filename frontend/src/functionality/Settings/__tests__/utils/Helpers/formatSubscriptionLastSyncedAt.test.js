import { describe, it, expect, vi, afterEach } from 'vitest';
import formatSubscriptionLastSyncedAt from '../../../utils/Helpers/formatSubscriptionLastSyncedAt.js';

describe('formatSubscriptionLastSyncedAt', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns "Never" when no timestamp is provided', () => {
        expect(formatSubscriptionLastSyncedAt(null)).toBe('Never');
        expect(formatSubscriptionLastSyncedAt(undefined)).toBe('Never');
        expect(formatSubscriptionLastSyncedAt('')).toBe('Never');
    });

    it('formats the timestamp using toLocaleString', () => {
        const toLocaleStringSpy = vi
            .spyOn(Date.prototype, 'toLocaleString')
            .mockReturnValue('13/04/2026, 19:30:00');

        const result = formatSubscriptionLastSyncedAt(
            '2026-04-13T18:30:00.000Z'
        );

        expect(result).toBe('13/04/2026, 19:30:00');
        expect(toLocaleStringSpy).toHaveBeenCalledTimes(1);
    });
});