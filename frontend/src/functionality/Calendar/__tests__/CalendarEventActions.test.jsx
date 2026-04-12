import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CalendarEventActions from '../CalendarEventActions.jsx';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

describe('CalendarEventActions', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renders edit and delete buttons', () => {
        render(
            <CalendarEventActions
                calendarEvent={{ id: 42 }}
                handleDelete={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: 'Edit event' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete event' })).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('navigates to the edit page when Edit is clicked', () => {
        render(
            <CalendarEventActions
                calendarEvent={{ id: 42 }}
                handleDelete={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Edit event' }));

        expect(mockNavigate).toHaveBeenCalledWith('/timeblocks/42/edit');
    });

    it('calls handleDelete with the event id when Delete is clicked', () => {
        const mockHandleDelete = vi.fn();

        render(
            <CalendarEventActions
                calendarEvent={{ id: 42 }}
                handleDelete={mockHandleDelete}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Delete event' }));

        expect(mockHandleDelete).toHaveBeenCalledTimes(1);
        expect(mockHandleDelete).toHaveBeenCalledWith(42);
    });

    it('applies the button class to both buttons', () => {
        const { container } = render(
            <CalendarEventActions
                calendarEvent={{ id: 42 }}
                handleDelete={vi.fn()}
            />
        );

        expect(container.querySelectorAll('.button')).toHaveLength(2);
    });
});