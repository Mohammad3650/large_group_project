import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createCalendarCustomComponents } from '../createCalendarCustomComponents.jsx';

describe('Tests for createCalendarCustomComponents', () => {
    it('returns an eventModal component that renders CalendarEventModal', () => {
        const mockEventButtons = vi.fn(() => <button>Delete</button>);
        const mockHandleDelete = vi.fn();

        const components = createCalendarCustomComponents(
            mockEventButtons,
            mockHandleDelete
        );

        const calendarEvent = {
            id: 1,
            title: 'Test Event',
            date: '2026-04-10',
            startTime: '09:00',
            endTime: '10:00',
            location: 'Room A',
            blockType: 'lecture',
            description: 'Test description',
        };

        const EventModal = components.eventModal;

        render(<EventModal calendarEvent={calendarEvent} />);

        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('10/04/2026')).toBeInTheDocument();
        expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
        expect(screen.getByText('Room A')).toBeInTheDocument();
        expect(screen.getByText('lecture')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        expect(mockEventButtons).toHaveBeenCalledWith(calendarEvent, mockHandleDelete);
    });

    it('passes undefined eventButtons through and renders no action buttons', () => {
        const mockHandleDelete = vi.fn();

        const components = createCalendarCustomComponents(undefined, mockHandleDelete);

        const calendarEvent = {
            id: 2,
            title: 'Event Without Buttons',
            date: '2026-04-12',
            startTime: '12:00',
            endTime: '13:00',
            location: 'Room B',
            blockType: 'study',
            description: 'Independent study',
        };

        const EventModal = components.eventModal;

        render(<EventModal calendarEvent={calendarEvent} />);

        expect(screen.getByText('Event Without Buttons')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('returns an object with an eventModal function', () => {
        const components = createCalendarCustomComponents(vi.fn(), vi.fn());

        expect(components).toHaveProperty('eventModal');
        expect(typeof components.eventModal).toBe('function');
    });
});