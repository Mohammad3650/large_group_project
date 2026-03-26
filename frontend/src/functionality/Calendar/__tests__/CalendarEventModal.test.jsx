import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalendarEventModal from '../CalendarEventModal.jsx';

describe('CalendarEventModal', () => {
    const mockEvent = {
        id: 42,
        title: 'SEG Lecture',
        date: '2026-04-10',
        startTime: '09:00',
        endTime: '10:00',
        location: 'Bush House',
        blockType: 'lecture',
        description: 'Weekly lecture'
    };

    it('renders the event details', () => {
        render(
            <CalendarEventModal
                calendarEvent={mockEvent}
                eventButtons={vi.fn()}
                handleDelete={vi.fn()}
            />
        );

        expect(screen.getByText('SEG Lecture')).toBeInTheDocument();
        expect(screen.getByText('10/04/2026')).toBeInTheDocument();
        expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
        expect(screen.getByText('Bush House')).toBeInTheDocument();
        expect(screen.getByText('lecture')).toBeInTheDocument();
        expect(screen.getByText('Weekly lecture')).toBeInTheDocument();
    });

    it('calls eventButtons with calendarEvent and handleDelete when provided', () => {
        const mockHandleDelete = vi.fn();
        const mockEventButtons = vi.fn(() => <button>Edit</button>);

        render(
            <CalendarEventModal
                calendarEvent={mockEvent}
                eventButtons={mockEventButtons}
                handleDelete={mockHandleDelete}
            />
        );

        expect(mockEventButtons).toHaveBeenCalledTimes(1);
        expect(mockEventButtons).toHaveBeenCalledWith(
            mockEvent,
            mockHandleDelete
        );
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('renders no action buttons when eventButtons is not provided', () => {
        render(
            <CalendarEventModal
                calendarEvent={mockEvent}
                handleDelete={vi.fn()}
            />
        );

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});