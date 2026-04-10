import { describe, it, expect } from 'vitest';
import getNoSearchResults from '../../../utils/Helpers/getNoSearchResults.js';

const emptyFilteredTasks = {
    filteredPinned: [], filteredOverdue: [], filteredToday: [],
    filteredTomorrow: [], filteredWeek: [], filteredBeyondWeek: [], filteredCompleted: [],
};

describe('getNoSearchResults', () => {
    it('returns true when all filtered arrays are empty and the search term is non-empty', () => {
        expect(getNoSearchResults(emptyFilteredTasks, 'lecture')).toBe(true);
    });

    it('returns false when the search term is empty', () => {
        expect(getNoSearchResults(emptyFilteredTasks, '')).toBe(false);
    });

    it('returns false when the search term is only whitespace', () => {
        expect(getNoSearchResults(emptyFilteredTasks, '   ')).toBe(false);
    });

    it('returns false when at least one filtered array contains tasks', () => {
        expect(getNoSearchResults({ ...emptyFilteredTasks, filteredToday: [{ id: 1 }] }, 'lecture')).toBe(false);
    });
});