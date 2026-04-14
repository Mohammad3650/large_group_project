import { describe, it, expect, vi } from 'vitest';
import removeCalendarEvent from '../../../utils/Helpers/removeCalendarEvent.js';describe('removeCalendarEvent', () => {
    it('removes the event from the service, updates blocks, and increments calendar key', () => {
        const eventsService = {
            remove: vi.fn(),
        };

        const setBlocks = vi.fn();
        const setCalendarKey = vi.fn();

        removeCalendarEvent(2, eventsService, setBlocks, setCalendarKey);

        expect(eventsService.remove).toHaveBeenCalledWith(2);
        expect(setBlocks).toHaveBeenCalledTimes(1);
        expect(setCalendarKey).toHaveBeenCalledTimes(1);

        const updateBlocksFn = setBlocks.mock.calls[0][0];
        const incrementKeyFn = setCalendarKey.mock.calls[0][0];

        const originalBlocks = [
            { id: 1, title: 'A' },
            { id: 2, title: 'B' },
            { id: 3, title: 'C' },
        ];

        const updatedBlocks = updateBlocksFn(originalBlocks);

        expect(updatedBlocks).toEqual([
            { id: 1, title: 'A' },
            { id: 3, title: 'C' },
        ]);

        expect(incrementKeyFn(5)).toBe(6);
    });

    it('keeps blocks unchanged when the id does not exist', () => {
        const eventsService = {
            remove: vi.fn(),
        };

        const setBlocks = vi.fn();
        const setCalendarKey = vi.fn();

        removeCalendarEvent(99, eventsService, setBlocks, setCalendarKey);

        const updateBlocksFn = setBlocks.mock.calls[0][0];

        const originalBlocks = [
            { id: 1, title: 'A' },
            { id: 2, title: 'B' },
        ];

        expect(updateBlocksFn(originalBlocks)).toEqual(originalBlocks);
        expect(eventsService.remove).toHaveBeenCalledWith(99);

        const incrementKeyFn = setCalendarKey.mock.calls[0][0];
        expect(incrementKeyFn(0)).toBe(1);
    });
});