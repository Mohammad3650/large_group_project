import { describe, it, expect } from 'vitest';
import formatDate from '../../../utils/Helpers/formatDate.js';

describe('formatDate', () => {
    it('converts an ISO date into British format', () => {
        expect(formatDate('2026-04-13')).toBe('13/04/2026');
    });

    it('handles another valid ISO date correctly', () => {
        expect(formatDate('1999-12-01')).toBe('01/12/1999');
    });
});