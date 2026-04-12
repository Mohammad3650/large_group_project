import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavbarLinks from '../../Navbar/NavbarLinks.jsx';

vi.mock('../../stylesheets/Navbar/NavbarLinks.css', () => ({}));
vi.mock('react-icons/lu', () => ({
    LuClipboardList: () => <svg data-testid="icon-clipboard" />,
    LuCalendar: () => <svg data-testid="icon-calendar" />,
}));

describe('NavbarLinks component', () => {
    it('renders the Dashboard link', () => {
        render(<MemoryRouter><NavbarLinks /></MemoryRouter>);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders the Calendar link', () => {
        render(<MemoryRouter><NavbarLinks /></MemoryRouter>);
        expect(screen.getByText('Calendar')).toBeInTheDocument();
    });

    it('links to the dashboard page', () => {
        render(<MemoryRouter><NavbarLinks /></MemoryRouter>);
        expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    });

    it('links to the calendar page', () => {
        render(<MemoryRouter><NavbarLinks /></MemoryRouter>);
        expect(screen.getByText('Calendar').closest('a')).toHaveAttribute('href', '/calendar');
    });

    it('renders the clipboard and calendar icons', () => {
        render(<MemoryRouter><NavbarLinks /></MemoryRouter>);
        expect(screen.getByTestId('icon-clipboard')).toBeInTheDocument();
        expect(screen.getByTestId('icon-calendar')).toBeInTheDocument();
    });
});