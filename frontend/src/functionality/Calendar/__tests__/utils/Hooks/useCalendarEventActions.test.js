import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockNavigate } = vi.hoisted(() => ({
    mockNavigate: vi.fn()
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

import useCalendarEventActions from '../../../utils/Hooks/useCalendarEventActions.js';

describe('useCalendarEventActions', () => {
    let handleDelete;

    beforeEach(() => {
        vi.clearAllMocks();
        handleDelete = vi.fn();
    });

    it('returns both handlers', () => {
        const result = useCalendarEventActions({
            calendarEvent: { id: 123 },
            handleDelete
        });

        expect(result).toHaveProperty('handleEdit');
        expect(result).toHaveProperty('handleDeleteEvent');
    });

    it('handleEdit navigates to the correct edit page', () => {
        const { handleEdit } = useCalendarEventActions({
            calendarEvent: { id: 42 },
            handleDelete
        });

        handleEdit();

        expect(mockNavigate).toHaveBeenCalledWith('/time-blocks/42/edit');
    });

    it('handleDeleteEvent calls handleDelete with the correct id', () => {
        const { handleDeleteEvent } = useCalendarEventActions({
            calendarEvent: { id: 77 },
            handleDelete
        });

        handleDeleteEvent();

        expect(handleDelete).toHaveBeenCalledWith(77);
    });

    it('handles different id types (string id)', () => {
        const { handleEdit, handleDeleteEvent } = useCalendarEventActions({
            calendarEvent: { id: 'abc' },
            handleDelete
        });

        handleEdit();
        handleDeleteEvent();

        expect(mockNavigate).toHaveBeenCalledWith('/time-blocks/abc/edit');
        expect(handleDelete).toHaveBeenCalledWith('abc');
    });
});