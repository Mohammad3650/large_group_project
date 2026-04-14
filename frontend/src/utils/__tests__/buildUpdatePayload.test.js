import { describe, it, expect, vi, beforeEach } from 'vitest';
import buildUpdatePayload from '../Helpers/buildUpdatePayload';
import getUserTimezone from '../Helpers/getUserTimezone';

vi.mock('../Helpers/getUserTimezone', () => ({
    default: vi.fn()
}));

describe('buildUpdatePayload', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('normalises empty strings to null and adds timezone', () => {
        getUserTimezone.mockReturnValue('Europe/London');

        const input = {
            title: 'Lecture',
            start_time: '',
            end_time: ''
        };

        const result = buildUpdatePayload(input);

        expect(result).toEqual({
            title: 'Lecture',
            start_time: null,
            end_time: null,
            timezone: 'Europe/London'
        });

        expect(getUserTimezone).toHaveBeenCalledTimes(1);
    });

    it('keeps valid time values unchanged', () => {
        getUserTimezone.mockReturnValue('Europe/London');

        const input = {
            title: 'Workshop',
            start_time: '09:00',
            end_time: '10:00'
        };

        const result = buildUpdatePayload(input);

        expect(result).toEqual({
            title: 'Workshop',
            start_time: '09:00',
            end_time: '10:00',
            timezone: 'Europe/London'
        });
    });

    it('handles mixed empty and valid time values', () => {
        getUserTimezone.mockReturnValue('UTC');

        const input = {
            title: 'Meeting',
            start_time: '',
            end_time: '14:30'
        };

        const result = buildUpdatePayload(input);

        expect(result).toEqual({
            title: 'Meeting',
            start_time: null,
            end_time: '14:30',
            timezone: 'UTC'
        });
    });
});