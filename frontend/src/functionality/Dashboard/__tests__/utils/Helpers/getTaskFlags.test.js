import { describe, it, expect, vi, beforeEach } from 'vitest';
import getTaskFlags from '../../../utils/Helpers/getTaskFlags.js';

vi.mock('../../../utils/Helpers/getDate.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/getDateBoundaries.js', () => ({ default: vi.fn() }));

import * as getDateModule from '../../../utils/Helpers/getDate.js';
import * as getDateBoundariesModule from '../../../utils/Helpers/getDateBoundaries.js';

const TODAY = new Date('2026-04-10T00:00:00.000Z');
const YESTERDAY = new Date('2026-04-09T00:00:00.000Z');

describe('getTaskFlags', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getDateBoundariesModule.default.mockReturnValue({ today: TODAY });
        getDateModule.default.mockReturnValue(TODAY);
    });

    it('returns a function when called', () => {
        expect(typeof getTaskFlags(false, false)).toBe('function');
    });

    it('calls getDateBoundaries once when the outer function is called', () => {
        getTaskFlags(false, false);
        expect(getDateBoundariesModule.default).toHaveBeenCalledTimes(1);
    });

    describe('taskCompleted', () => {
        it('is true when completed=true regardless of task.completed_at', () => {
            const getFlags = getTaskFlags(false, true);
            expect(getFlags({ completed_at: null }).taskCompleted).toBe(true);
        });

        it('is true when completed=false and task.completed_at is set', () => {
            const getFlags = getTaskFlags(false, false);
            expect(getFlags({ completed_at: '2026-04-07T10:00:00Z' }).taskCompleted).toBe(true);
        });

        it('is false when completed=false and task.completed_at is null', () => {
            const getFlags = getTaskFlags(false, false);
            expect(getFlags({ completed_at: null }).taskCompleted).toBe(false);
        });
    });

    describe('taskOverdue', () => {
        it('is true when overdue=true regardless of task date', () => {
            const getFlags = getTaskFlags(true, false);
            expect(getFlags({ completed_at: null }).taskOverdue).toBe(true);
        });

        it('is true when overdue=false, not completed, and task date is before today', () => {
            getDateModule.default.mockReturnValue(YESTERDAY);
            const getFlags = getTaskFlags(false, false);
            expect(getFlags({ completed_at: null }).taskOverdue).toBe(true);
        });

        it('is false when overdue=false and task date is equal to today', () => {
            getDateModule.default.mockReturnValue(TODAY);
            const getFlags = getTaskFlags(false, false);
            expect(getFlags({ completed_at: null }).taskOverdue).toBe(false);
        });

        it('is false when overdue=false and task is completed even if date is before today', () => {
            getDateModule.default.mockReturnValue(YESTERDAY);
            const getFlags = getTaskFlags(false, false);
            expect(getFlags({ completed_at: '2026-04-07T10:00:00Z' }).taskOverdue).toBe(false);
        });
    });
});
