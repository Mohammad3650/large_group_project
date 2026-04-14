import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
const {
    mockDeleteTimeBlock,
    mockConfirmEventDeletion
} = vi.hoisted(() => ({
    mockDeleteTimeBlock: vi.fn(),
    mockConfirmEventDeletion: vi.fn()
}));

vi.mock('../../../../../utils/Api/deleteTimeBlock.js', () => ({
    default: mockDeleteTimeBlock
}));

vi.mock('../../../utils/Helpers/confirmEventDeletion.js', () => ({
    default: mockConfirmEventDeletion
}));

import createCalendarDeleteHandler from '../../../utils/Helpers/createCalendarDeleteHandler.js';

describe('createCalendarDeleteHandler', () => {
    let eventsService;
    let setBlocks;
    let setCalendarKey;

    beforeEach(() => {
        vi.clearAllMocks();

        eventsService = { remove: vi.fn() };
        setBlocks = vi.fn();
        setCalendarKey = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns a function', () => {
        const handler = createCalendarDeleteHandler(
            eventsService,
            setBlocks,
            setCalendarKey
        );

        expect(typeof handler).toBe('function');
    });

    it('does nothing when deletion is not confirmed', () => {
        mockConfirmEventDeletion.mockReturnValue(false);

        const handler = createCalendarDeleteHandler(
            eventsService,
            setBlocks,
            setCalendarKey
        );

        handler(123);

        expect(mockConfirmEventDeletion).toHaveBeenCalledTimes(1);
        expect(mockDeleteTimeBlock).not.toHaveBeenCalled();
        expect(eventsService.remove).not.toHaveBeenCalled();
        expect(setBlocks).not.toHaveBeenCalled();
        expect(setCalendarKey).not.toHaveBeenCalled();
    });

    it('deletes the event and removes it from the calendar when confirmed', async () => {
        mockConfirmEventDeletion.mockReturnValue(true);
        mockDeleteTimeBlock.mockResolvedValue(undefined);

        const handler = createCalendarDeleteHandler(
            eventsService,
            setBlocks,
            setCalendarKey
        );

        handler(123);

        expect(mockConfirmEventDeletion).toHaveBeenCalledTimes(1);
        expect(mockDeleteTimeBlock).toHaveBeenCalledWith(123);

        await waitFor(() => {
            expect(eventsService.remove).toHaveBeenCalledWith(123);
            expect(setBlocks).toHaveBeenCalledTimes(1);
            expect(setCalendarKey).toHaveBeenCalledTimes(1);
        });

        const updateBlocksFn = setBlocks.mock.calls[0][0];
        const incrementKeyFn = setCalendarKey.mock.calls[0][0];

        expect(
            updateBlocksFn([
                { id: 123, title: 'Delete me' },
                { id: 999, title: 'Keep me' }
            ])
        ).toEqual([{ id: 999, title: 'Keep me' }]);

        expect(incrementKeyFn(5)).toBe(6);
    });

    it('logs the error when deletion fails after confirmation', async () => {
        const error = new Error('API delete failed');
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        mockConfirmEventDeletion.mockReturnValue(true);
        mockDeleteTimeBlock.mockRejectedValue(error);

        const handler = createCalendarDeleteHandler(
            eventsService,
            setBlocks,
            setCalendarKey
        );

        handler(456);

        expect(mockConfirmEventDeletion).toHaveBeenCalledTimes(1);
        expect(mockDeleteTimeBlock).toHaveBeenCalledWith(456);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to delete event with ID',
                456,
                error
            );
        });

        expect(eventsService.remove).not.toHaveBeenCalled();
        expect(setBlocks).not.toHaveBeenCalled();
        expect(setCalendarKey).not.toHaveBeenCalled();
    });
});