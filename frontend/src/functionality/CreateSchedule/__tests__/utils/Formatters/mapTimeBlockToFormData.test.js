import { describe, it, expect, vi, beforeEach } from 'vitest';
import mapTimeBlockToFormData from '../../../utils/Formatters/mapTimeBlockToFormData.js';
import toLocalDateTime from '../../../../../utils/Formatters/toLocalDateTime.js';

// mock dependency
vi.mock('../../../../../utils/Formatters/toLocalDateTime.js', () => ({
    default: vi.fn()
}));

describe('mapTimeBlockToFormData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('maps API data into form-ready structure', () => {
        toLocalDateTime
            .mockReturnValueOnce({
                localDate: '2026-04-14',
                localTime: '09:00'
            })
            .mockReturnValueOnce({
                localDate: '2026-04-14',
                localTime: '10:00'
            });

        const input = {
            id: 1,
            date: '2026-04-14',
            name: 'Lecture',
            location: 'Room A',
            block_type: 'teaching',
            description: 'Intro lecture',
            start_time: '09:00',
            end_time: '10:00'
        };

        const result = mapTimeBlockToFormData(input);

        expect(result).toEqual({
            id: 1,
            date: '2026-04-14',
            name: 'Lecture',
            location: 'Room A',
            block_type: 'teaching',
            description: 'Intro lecture',
            start_time: '09:00',
            end_time: '10:00'
        });

        expect(toLocalDateTime).toHaveBeenCalledTimes(2);
    });

    it('passes correct arguments to toLocalDateTime', () => {
        toLocalDateTime.mockReturnValue({
            localDate: '2026-04-14',
            localTime: '12:00'
        });

        const input = {
            id: 2,
            date: '2026-04-14',
            start_time: '12:00',
            end_time: '13:00',
            name: 'Seminar',
            location: 'Room B',
            block_type: 'event',
            description: 'Seminar session'
        };

        mapTimeBlockToFormData(input);

        expect(toLocalDateTime).toHaveBeenNthCalledWith(
            1,
            '2026-04-14',
            '12:00'
        );

        expect(toLocalDateTime).toHaveBeenNthCalledWith(
            2,
            '2026-04-14',
            '13:00'
        );
    });

    it('returns independent start and end conversions', () => {
        toLocalDateTime
            .mockReturnValueOnce({
                localDate: '2026-04-14',
                localTime: '08:00'
            })
            .mockReturnValueOnce({
                localDate: '2026-04-14',
                localTime: '09:30'
            });

        const input = {
            id: 3,
            date: '2026-04-14',
            start_time: '08:00',
            end_time: '09:30',
            name: 'Workshop',
            location: 'Lab',
            block_type: 'practical',
            description: 'Hands-on work'
        };

        const result = mapTimeBlockToFormData(input);

        expect(result.start_time).toBe('08:00');
        expect(result.end_time).toBe('09:30');
    });
});