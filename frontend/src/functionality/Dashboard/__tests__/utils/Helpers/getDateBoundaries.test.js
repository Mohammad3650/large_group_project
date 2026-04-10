import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import getDateBoundaries from '../../../utils/Helpers/getDateBoundaries.js';

describe('getDateBoundaries', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-07T12:34:56'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns today normalised to midnight', () => {
        expect(getDateBoundaries().today).toEqual(new Date('2026-04-07T00:00:00'));
    });

    it('returns tomorrow as one day after today at midnight', () => {
        expect(getDateBoundaries().tomorrow).toEqual(new Date('2026-04-08T00:00:00'));
    });

    it('returns dayAfterTomorrow as two days after today at midnight', () => {
        expect(getDateBoundaries().dayAfterTomorrow).toEqual(new Date('2026-04-09T00:00:00'));
    });

    it('returns weekEnd as seven days after today at midnight', () => {
        expect(getDateBoundaries().weekEnd).toEqual(new Date('2026-04-14T00:00:00'));
    });

    it('returns all four boundaries as Date objects', () => {
        const { today, tomorrow, dayAfterTomorrow, weekEnd } = getDateBoundaries();
        [today, tomorrow, dayAfterTomorrow, weekEnd].forEach(d => expect(d).toBeInstanceOf(Date));
    });

    it('does not mutate dates when computing boundaries', () => {
        const { today, tomorrow, dayAfterTomorrow, weekEnd } = getDateBoundaries();
        expect(today).toEqual(new Date('2026-04-07T00:00:00'));
        expect(tomorrow).toEqual(new Date('2026-04-08T00:00:00'));
        expect(dayAfterTomorrow).toEqual(new Date('2026-04-09T00:00:00'));
        expect(weekEnd).toEqual(new Date('2026-04-14T00:00:00'));
    });
});