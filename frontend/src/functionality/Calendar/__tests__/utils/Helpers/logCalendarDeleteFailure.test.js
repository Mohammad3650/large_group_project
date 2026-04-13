import { describe, it, expect, vi, afterEach } from 'vitest';
import logCalendarDeleteFailure from '../../../utils/Helpers/logCalendarDeleteFailure.js';
describe('logCalendarDeleteFailure', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('logs the delete failure with the event id and error', () => {
        const error = new Error('Delete failed');
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        logCalendarDeleteFailure(42, error);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to delete event with ID',
            42,
            error
        );
    });
});