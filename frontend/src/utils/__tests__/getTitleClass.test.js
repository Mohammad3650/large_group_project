import { describe, it, expect } from 'vitest';
import getTitleClass from '../Helpers/getTitleClass.js';

describe('Tests for getTitleClass', () => {
    it('returns overdue-title for the overdue variant', () => {
        expect(getTitleClass('overdue')).toBe('overdue-title');
    });

    it('returns completed-title for the completed variant', () => {
        expect(getTitleClass('completed')).toBe('completed-title');
    });

    it('returns pinned-title for the pinned variant', () => {
        expect(getTitleClass('pinned')).toBe('pinned-title');
    });

    it('returns an empty string for a date group variant', () => {
        expect(getTitleClass('today')).toBe('');
    });

    it('returns an empty string for an empty variant', () => {
        expect(getTitleClass('')).toBe('');
    });
});
