import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalendarEmptyState from '../CalendarEmptyState.jsx';

vi.mock('../../../components/WelcomeMessage.jsx', () => ({
    default: ({ page, username }) => <div>{`WelcomeMessage ${page} ${username}`}</div>,
}));

vi.mock('../../../components/AddTaskButton.jsx', () => ({
    default: () => <button>Add Task</button>,
}));

describe('CalendarEmptyState', () => {
    it('renders the welcome message, add task button, and empty state text', () => {
        render(<CalendarEmptyState username="Mohammad" />);

        expect(screen.getByText('WelcomeMessage calendar Mohammad')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
        expect(screen.getByText('No events yet.')).toBeInTheDocument();
    });
});