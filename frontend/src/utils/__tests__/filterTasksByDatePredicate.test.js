import { describe, it, expect } from 'vitest';
import filterTasksByDatePredicate from '../Helpers/filterTasksByDatePredicate.js';

const makeEntry = (block, date) => ({ block, date });

const today = new Date('2026-03-18');
const yesterday = new Date('2026-03-17');
const tomorrow = new Date('2026-03-19');

const blockA = { id: 1, name: 'Block A' };
const blockB = { id: 2, name: 'Block B' };
const blockC = { id: 3, name: 'Block C' };

const blocksWithDates = [
    makeEntry(blockA, yesterday),
    makeEntry(blockB, today),
    makeEntry(blockC, tomorrow),
];

describe('filterTasksByDatePredicate', () => {
    it('returns only blocks whose date satisfies the predicate', () => {
        const result = filterTasksByDatePredicate(
            blocksWithDates,
            (date) => date >= today
        );
        expect(result).toEqual([blockB, blockC]);
    });

    it('returns an empty array when no dates satisfy the predicate', () => {
        const result = filterTasksByDatePredicate(
            blocksWithDates,
            () => false
        );
        expect(result).toEqual([]);
    });

    it('returns all blocks when all dates satisfy the predicate', () => {
        const result = filterTasksByDatePredicate(
            blocksWithDates,
            () => true
        );
        expect(result).toEqual([blockA, blockB, blockC]);
    });

    it('returns an empty array when given an empty array', () => {
        const result = filterTasksByDatePredicate([], () => true);
        expect(result).toEqual([]);
    });

    it('returns only the block objects, not the date wrapper', () => {
        const result = filterTasksByDatePredicate(
            [makeEntry(blockA, today)],
            () => true
        );
        expect(result[0]).toEqual(blockA);
        expect(result[0]).not.toHaveProperty('date');
    });
});