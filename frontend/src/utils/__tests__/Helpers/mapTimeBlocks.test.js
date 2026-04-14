import { describe, it, expect, vi, beforeEach } from 'vitest';
import mapTimeBlocks from '../../Helpers/mapTimeBlocks.js';

vi.mock('../../Formatters/toLocalDateTime.js', () => ({
    default: vi.fn((date, time) => {
        const localTime = time.slice(0, 5);
        const zonedDateTime = `${date}T${localTime}[Europe/London]`;
        return { zonedDateTime, localDate: date, localTime };
    }),
}));

import toLocalDateTime from '../../Formatters/toLocalDateTime.js';

const baseBlock = {
    id: 1,
    name: 'Lecture',
    date: '2024-03-18',
    start_time: '09:00:00',
    end_time: '10:00:00',
    location: 'Room 101',
    block_type: 'lecture',
    description: 'Introduction to testing',
    completed_at: null,
    pinned: false,
    pinned_at: null,
};

describe('Tests for mapTimeBlocks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('maps a block with all fields correctly', () => {
        const result = mapTimeBlocks([baseBlock]);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: 1,
            name: 'Lecture',
            title: 'Lecture',
            date: '2024-03-18',
            startTime: '09:00',
            endTime: '10:00',
            start: '2024-03-18T09:00[Europe/London]',
            end: '2024-03-18T10:00[Europe/London]',
            location: 'Room 101',
            blockType: 'Lecture',
            description: 'Introduction to testing',
            completed_at: null,
            pinned: false,
            pinned_at: null,
            _options: { additionalClasses: ['sx-type-lecture'] },
        });
    });

    it('calls toLocalDateTime with date + start_time and date + end_time', () => {
        mapTimeBlocks([baseBlock]);
        expect(toLocalDateTime).toHaveBeenCalledWith('2024-03-18', '09:00:00');
        expect(toLocalDateTime).toHaveBeenCalledWith('2024-03-18', '10:00:00');
        expect(toLocalDateTime).toHaveBeenCalledTimes(2);
    });

    it('uses the block id when present', () => {
        const result = mapTimeBlocks([{ ...baseBlock, id: 42 }]);
        expect(result[0].id).toBe(42);
    });

    it('uses the array index as the id when block.id is null', () => {
        const result = mapTimeBlocks([{ ...baseBlock, id: null }]);
        expect(result[0].id).toBe(0);
    });

    it('uses the array index as the id when block.id is undefined', () => {
        const result = mapTimeBlocks([{ ...baseBlock, id: undefined }]);
        expect(result[0].id).toBe(0);
    });

    it('assigns correct indexes as ids when multiple blocks lack ids', () => {
        const result = mapTimeBlocks([
            { ...baseBlock, id: undefined },
            { ...baseBlock, id: undefined },
        ]);
        expect(result[0].id).toBe(0);
        expect(result[1].id).toBe(1);
    });

    it('capitalises block_type for blockType', () => {
        const result = mapTimeBlocks([{ ...baseBlock, block_type: 'seminar' }]);
        expect(result[0].blockType).toBe('Seminar');
    });

    it('sets blockType to N/A when block_type is null', () => {
        const result = mapTimeBlocks([{ ...baseBlock, block_type: null }]);
        expect(result[0].blockType).toBe('N/A');
    });

    it('sets blockType to N/A when block_type is undefined', () => {
        const result = mapTimeBlocks([{ ...baseBlock, block_type: undefined }]);
        expect(result[0].blockType).toBe('N/A');
    });

    it('sets description to N/A when description is an empty string', () => {
        const result = mapTimeBlocks([{ ...baseBlock, description: '' }]);
        expect(result[0].description).toBe('N/A');
    });

    it('sets description to N/A when description is null', () => {
        const result = mapTimeBlocks([{ ...baseBlock, description: null }]);
        expect(result[0].description).toBe('N/A');
    });

    it('sets description to N/A when description is undefined', () => {
        const result = mapTimeBlocks([{ ...baseBlock, description: undefined }]);
        expect(result[0].description).toBe('N/A');
    });

    it('preserves a non-empty description', () => {
        const result = mapTimeBlocks([{ ...baseBlock, description: 'Deep dive' }]);
        expect(result[0].description).toBe('Deep dive');
    });

    it('preserves completed_at when set', () => {
        const result = mapTimeBlocks([{ ...baseBlock, completed_at: '2024-03-18T10:00:00.000Z' }]);
        expect(result[0].completed_at).toBe('2024-03-18T10:00:00.000Z');
    });

    it('defaults completed_at to null when absent', () => {
        const { completed_at, ...blockWithout } = baseBlock;
        const result = mapTimeBlocks([blockWithout]);
        expect(result[0].completed_at).toBeNull();
    });

    it('preserves pinned: true when set', () => {
        const result = mapTimeBlocks([{ ...baseBlock, pinned: true }]);
        expect(result[0].pinned).toBe(true);
    });

    it('defaults pinned to false when absent', () => {
        const { pinned, ...blockWithout } = baseBlock;
        const result = mapTimeBlocks([blockWithout]);
        expect(result[0].pinned).toBe(false);
    });

    it('preserves pinned_at when set', () => {
        const result = mapTimeBlocks([{ ...baseBlock, pinned_at: '2024-03-18T08:00:00.000Z' }]);
        expect(result[0].pinned_at).toBe('2024-03-18T08:00:00.000Z');
    });

    it('defaults pinned_at to null when absent', () => {
        const { pinned_at, ...blockWithout } = baseBlock;
        const result = mapTimeBlocks([blockWithout]);
        expect(result[0].pinned_at).toBeNull();
    });

    it('maps multiple blocks and preserves order', () => {
        const result = mapTimeBlocks([
            baseBlock,
            { ...baseBlock, id: 2, name: 'Seminar', block_type: 'seminar' },
        ]);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Lecture');
        expect(result[1].name).toBe('Seminar');
        expect(result[1].blockType).toBe('Seminar');
    });

    it('returns an empty array when given an empty array', () => {
        expect(mapTimeBlocks([])).toEqual([]);
    });
});
