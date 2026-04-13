import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavbarUserDropdown from '../../Navbar/NavbarUserDropdown.jsx';

vi.mock('../../stylesheets/Navbar/NavbarUserDropdown.css', () => ({}));
vi.mock('../../LogoutButton.jsx', () => ({
    default: () => <button>Logout</button>,
}));
vi.mock('react-icons/fa', () => ({
    FaUser: () => <svg data-testid="icon-user" />,
    FaCog: () => <svg data-testid="icon-cog" />,
}));

const renderDropdown = (props = {}) =>
    render(
        <MemoryRouter>
            <NavbarUserDropdown username="testuser" onClose={vi.fn()} {...props} />
        </MemoryRouter>
    );

describe('NavbarUserDropdown component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the username', () => {
        renderDropdown();
        expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('renders the settings link', () => {
        renderDropdown();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('links to the settings page', () => {
        renderDropdown();
        expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
    });

    it('renders the logout button', () => {
        renderDropdown();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('renders the user and cog icons', () => {
        renderDropdown();
        expect(screen.getByTestId('icon-user')).toBeInTheDocument();
        expect(screen.getByTestId('icon-cog')).toBeInTheDocument();
    });

    it('calls onClose when the settings link is clicked', () => {
        const onClose = vi.fn();
        renderDropdown({ onClose });
        fireEvent.click(screen.getByText('Settings'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});