import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import createCalendarCustomComponents from '../CreateCalendarCustomComponents.jsx';

vi.mock('../CalendarEventModal.jsx', () => ({
    default: ({ calendarEvent, eventButtons, handleDelete }) => (
        <div>
            <h2>{calendarEvent.title}</h2>
            <p>{calendarEvent.location}</p>
            <p>{calendarEvent.blockType}</p>
            <p>{calendarEvent.description}</p>
            <div className="buttons">
                {eventButtons ? eventButtons(calendarEvent, handleDelete) : null}
            </div>
        </div>
    )
}));

describe('Tests for createCalendarCustomComponents', () => {
    it('returns an eventModal component that renders CalendarEventModal', () => {
        const mockEventButtons = vi.fn((calendarEvent) => <button>Edit {calendarEvent.id}</button>);
        const mockHandleDelete = vi.fn();

        const components = createCalendarCustomComponents(mockEventButtons, mockHandleDelete);

        const calendarEvent = {
            id: 7,
            title: 'Algorithms Lecture',
            location: 'Bush House',
            blockType: 'Lecture',
            description: 'Graphs and shortest paths'
        };

        render(<components.eventModal calendarEvent={calendarEvent} />);

        expect(screen.getByText('Algorithms Lecture')).toBeInTheDocument();
        expect(screen.getByText('Bush House')).toBeInTheDocument();
        expect(screen.getByText('Lecture')).toBeInTheDocument();
        expect(screen.getByText('Graphs and shortest paths')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Edit 7' })).toBeInTheDocument();

        expect(mockEventButtons).toHaveBeenCalledWith(calendarEvent, mockHandleDelete);
    });

    it('passes undefined eventButtons through and renders no action buttons', () => {
        const mockHandleDelete = vi.fn();

        const components = createCalendarCustomComponents(undefined, mockHandleDelete);

        const calendarEvent = {
            id: 7,
            title: 'Algorithms Lecture',
            location: 'Bush House',
            blockType: 'Lecture',
            description: 'Graphs and shortest paths'
        };

        const { container } = render(<components.eventModal calendarEvent={calendarEvent} />);

        expect(screen.getByText('Algorithms Lecture')).toBeInTheDocument();
        expect(container.querySelector('.buttons')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('returns an object with an eventModal function', () => {
        const components = createCalendarCustomComponents(vi.fn(), vi.fn());

        expect(components).toHaveProperty('eventModal');
        expect(typeof components.eventModal).toBe('function');
    });
});
