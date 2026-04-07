import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import getDateBoundaries from '../Helpers/getDateBoundaries';

describe('getDateBoundaries', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-07T12:34:56'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns today normalised to midnight', () => {
        const { today } = getDateBoundaries();
        expect(today).toEqual(new Date('2026-04-07T00:00:00'));
    });

    it('returns tomorrow as one day after today at midnight', () => {
        const { tomorrow } = getDateBoundaries();
        expect(tomorrow).toEqual(new Date('2026-04-08T00:00:00'));
    });

    it('returns dayAfterTomorrow as two days after today at midnight', () => {
        const { dayAfterTomorrow } = getDateBoundaries();
        expect(dayAfterTomorrow).toEqual(new Date('2026-04-09T00:00:00'));
    });

    it('returns weekEnd as seven days after today at midnight', () => {
        const { weekEnd } = getDateBoundaries();
        expect(weekEnd).toEqual(new Date('2026-04-14T00:00:00'));
    });

    it('returns all four boundaries as Date objects', () => {
        const { today, tomorrow, dayAfterTomorrow, weekEnd } = getDateBoundaries();
        expect(today).toBeInstanceOf(Date);
        expect(tomorrow).toBeInstanceOf(Date);
        expect(dayAfterTomorrow).toBeInstanceOf(Date);
        expect(weekEnd).toBeInstanceOf(Date);
    });

    it('does not mutate dates when computing boundaries', () => {
        const { today, tomorrow, dayAfterTomorrow, weekEnd } = getDateBoundaries();
        expect(today).toEqual(new Date('2026-04-07T00:00:00'));
        expect(tomorrow).toEqual(new Date('2026-04-08T00:00:00'));
        expect(dayAfterTomorrow).toEqual(new Date('2026-04-09T00:00:00'));
        expect(weekEnd).toEqual(new Date('2026-04-14T00:00:00'));
    });
});