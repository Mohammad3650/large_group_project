import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

import Navbar from '../Navbar';
import useAuthStatus from '../../utils/Auth/authStatus';
import useUsername from '../../utils/Hooks/useUsername.js';
import useDropdown from '../../utils/Hooks/useDropdown.js';

vi.mock('../../utils/Auth/authStatus', () => ({
    default: vi.fn()
}));

vi.mock('../../utils/Hooks/useUsername.js', () => ({
    default: vi.fn()
}));

vi.mock('../../utils/Hooks/useDropdown.js', () => ({
    default: vi.fn()
}));

vi.mock('../LogoutButton.jsx', () => ({
    default: () => <button>Logout</button>
}));

vi.mock('../ToggleDarkMode.jsx', () => ({
    default: ({ theme }) => <button>{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</button>
}));

vi.mock('../stylesheets/Navbar.css', () => ({}));

const mockSetDropdownOpen = vi.fn();
const mockDropdownRef = { current: null };

function renderNavbar(theme = 'light') {
    return render(
        <MemoryRouter>
            <Navbar theme={theme} toggleTheme={vi.fn()} />
        </MemoryRouter>
    );
}

describe('Tests for Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useDropdown.mockReturnValue({
            dropdownOpen: false,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: mockDropdownRef
        });
    });

    describe('when the user is not logged in', () => {
        beforeEach(() => {
            useAuthStatus.mockReturnValue(false);
            useUsername.mockReturnValue({ username: '', error: '' });
        });

        it('renders the site title linking to /', () => {
            renderNavbar();

            expect(screen.getByText('StudySync')).toBeInTheDocument();
            expect(screen.getByText('StudySync').closest('a')).toHaveAttribute('href', '/');
        });

        it('does not render the Dashboard or Calendar links', () => {
            renderNavbar();

            expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
            expect(screen.queryByText('Calendar')).not.toBeInTheDocument();
        });

        it("renders the 'Built for Students' tagline", () => {
            renderNavbar();

            expect(screen.getByText('Built for Students')).toBeInTheDocument();
        });

        it('does not render the user icon', () => {
            renderNavbar();

            expect(screen.queryByLabelText('User Icon')).not.toBeInTheDocument();
        });

        it('renders the theme toggle button', () => {
            renderNavbar('dark');

            expect(screen.getByText('🌙 Dark')).toBeInTheDocument();
        });
    });

    describe('when the user is logged in', () => {
        beforeEach(() => {
            useAuthStatus.mockReturnValue(true);
            useUsername.mockReturnValue({ username: 'testuser', error: '' });
        });

        it('renders the Dashboard link', () => {
            renderNavbar();

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute(
                'href',
                '/dashboard'
            );
        });

        it('renders the Calendar link', () => {
            renderNavbar();

            expect(screen.getByText('Calendar')).toBeInTheDocument();
            expect(screen.getByText('Calendar').closest('a')).toHaveAttribute('href', '/calendar');
        });

        it('renders the user icon', () => {
            renderNavbar();

            expect(screen.getByLabelText('User Icon')).toBeInTheDocument();
        });

        it("does not render the 'Built for Students' tagline", () => {
            renderNavbar();

            expect(screen.queryByText('Built for Students')).not.toBeInTheDocument();
        });

        it('keeps the dropdown closed by default', () => {
            renderNavbar();

            expect(screen.queryByText('testuser')).not.toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /settings/i })).not.toBeInTheDocument();
            expect(screen.queryByText('Logout')).not.toBeInTheDocument();
        });

        it('opens the dropdown when the user icon is clicked', () => {
            useDropdown.mockReturnValue({
                dropdownOpen: true,
                setDropdownOpen: mockSetDropdownOpen,
                dropdownRef: mockDropdownRef
            });

            renderNavbar();

            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
                'href',
                '/settings'
            );
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });

        it('calls setDropdownOpen when the user icon is clicked', () => {
            renderNavbar();

            fireEvent.click(screen.getByLabelText('User Icon'));

            expect(mockSetDropdownOpen).toHaveBeenCalledWith(expect.any(Function));

            const updaterFn = mockSetDropdownOpen.mock.calls[0][0];
            expect(updaterFn(false)).toBe(true);
            expect(updaterFn(true)).toBe(false);
        });

        it('calls setDropdownOpen with false when the Settings link is clicked', () => {
            useDropdown.mockReturnValue({
                dropdownOpen: true,
                setDropdownOpen: mockSetDropdownOpen,
                dropdownRef: mockDropdownRef
            });

            renderNavbar();

            fireEvent.click(screen.getByText('Settings'));
            expect(mockSetDropdownOpen).toHaveBeenCalledWith(false);
        });

        it('renders the theme toggle button when logged in', () => {
            renderNavbar('light');

            expect(screen.getByText('☀️ Light')).toBeInTheDocument();
        });
    });
});
