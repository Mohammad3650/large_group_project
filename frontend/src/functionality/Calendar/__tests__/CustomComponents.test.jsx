import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { customComponents } from '../CustomComponents.jsx';

describe('Tests for CustomComponents', () => {
    it('returns an eventModal component that renders CalendarEventModal', () => {
        const mockEventButtons = vi.fn(() => <button>Delete</button>);
        const mockHandleDelete = vi.fn();

        const mockIcons = {
            calendarIcon: 'calendar-icon.png',
            timeIcon: 'time-icon.png',
            locationIcon: 'location-icon.png',
            blockTypeIcon: 'block-type-icon.png',
            descriptionIcon: 'description-icon.png'
        };

        const components = customComponents(
            mockEventButtons,
            mockHandleDelete,
            mockIcons
        );

        const calendarEvent = {
            id: 1,
            title: 'Test Event',
            date: '2026-04-10',
            startTime: '09:00',
            endTime: '10:00',
            location: 'Room A',
            blockType: 'lecture',
            description: 'Test description'
        };

        const EventModal = components.eventModal;

        render(<EventModal calendarEvent={calendarEvent} />);

        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('10/04/2026')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        expect(mockEventButtons).toHaveBeenCalledWith(calendarEvent, mockHandleDelete);
    });
});