import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import renderEventActions from '../renderEventActions.jsx';

vi.mock('../CalendarEventActions.jsx', () => ({
    default: ({ calendarEvent, handleDelete }) => (
        <div>
            <span>{calendarEvent.title}</span>
            <button onClick={handleDelete}>Delete Event</button>
        </div>
    ),
}));

describe('renderEventActions', () => {
    it('returns CalendarEventActions with the correct props', () => {
        const handleDelete = vi.fn();
        const calendarEvent = { title: 'Study Session' };

        const element = renderEventActions(calendarEvent, handleDelete);
        render(element);

        expect(screen.getByText('Study Session')).toBeInTheDocument();

        screen.getByRole('button', { name: 'Delete Event' }).click();
        expect(handleDelete).toHaveBeenCalledTimes(1);
    });
});