import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

    beforeEach(() => {
        vi.clearAllMocks();
    });

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
        expect(mockEventButtons).toHaveBeenCalledWith(mockEvent, mockHandleDelete);
        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
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

    it('renders fallback values when all optional fields are missing', () => {
        const partialEvent = {
            title: 'Untitled Event'
        };

        render(
            <CalendarEventModal
                calendarEvent={partialEvent}
                handleDelete={vi.fn()}
            />
        );

        expect(screen.getByText('Untitled Event')).toBeInTheDocument();
        expect(screen.getByText('No date')).toBeInTheDocument();
        expect(screen.getByText('No time')).toBeInTheDocument();
        expect(screen.getByText('No location')).toBeInTheDocument();
        expect(screen.getByText('No category')).toBeInTheDocument();
        expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('renders no time when only one time value is missing', () => {
        const partialEvent = {
            title: 'Partial Time Event',
            date: '2026-04-10',
            startTime: '09:00',
            location: 'Bush House',
            blockType: 'lecture',
            description: 'Missing end time'
        };

        render(
            <CalendarEventModal
                calendarEvent={partialEvent}
                handleDelete={vi.fn()}
            />
        );

        expect(screen.getByText('10/04/2026')).toBeInTheDocument();
        expect(screen.getByText('No time')).toBeInTheDocument();
    });

    it('renders fallback values for empty strings', () => {
        const emptyStringEvent = {
            title: 'Empty Values Event',
            date: '2026-04-10',
            startTime: '11:00',
            endTime: '12:00',
            location: '',
            blockType: '',
            description: ''
        };

        render(
            <CalendarEventModal
                calendarEvent={emptyStringEvent}
                handleDelete={vi.fn()}
            />
        );

        expect(screen.getByText('10/04/2026')).toBeInTheDocument();
        expect(screen.getByText('11:00 - 12:00')).toBeInTheDocument();
        expect(screen.getByText('No location')).toBeInTheDocument();
        expect(screen.getByText('No category')).toBeInTheDocument();
        expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('applies the main modal layout classes', () => {
        const { container } = render(
            <CalendarEventModal
                calendarEvent={mockEvent}
                handleDelete={vi.fn()}
            />
        );

        expect(container.querySelector('.event-modal-container')).toBeInTheDocument();
        expect(container.querySelector('.sx__event-modal__title')).toBeInTheDocument();
        expect(container.querySelector('.sx__event-modal__description')).toBeInTheDocument();
        expect(container.querySelector('.buttons')).toBeInTheDocument();
        expect(container.querySelectorAll('.event-detail')).toHaveLength(5);
        expect(container.querySelectorAll('.event-detail-icon')).toHaveLength(5);
    });
});