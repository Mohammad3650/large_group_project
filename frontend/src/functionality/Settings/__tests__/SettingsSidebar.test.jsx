import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsSidebar from '../SettingsSidebar';

vi.mock('react-icons/fa', () => ({
    FaUser: () => <span data-testid="icon-profile" />,
    FaCalendarAlt: () => <span data-testid="icon-subscriptions" />,
    FaFileExport: () => <span data-testid="icon-export" />,
    FaSignOutAlt: () => <span data-testid="icon-logout" />,
}));

vi.mock('../../../components/LogoutButton.jsx', () => ({
    default: () => <button data-testid="logout-button">Logout</button>,
}));

vi.mock('../stylesheets/SettingsSidebar.css', () => ({}));

const mockSetActiveSection = vi.fn();

const renderSidebar = (activeSection = 'profile') =>
    render(
        <MemoryRouter>
            <SettingsSidebar
                activeSection={activeSection}
                setActiveSection={mockSetActiveSection}
            />
        </MemoryRouter>
    );

describe('SettingsSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all three navigation items', () => {
        renderSidebar();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Subscriptions')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('renders the logout button', () => {
        renderSidebar();
        expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('renders all navigation icons', () => {
        renderSidebar();
        expect(screen.getByTestId('icon-profile')).toBeInTheDocument();
        expect(screen.getByTestId('icon-subscriptions')).toBeInTheDocument();
        expect(screen.getByTestId('icon-export')).toBeInTheDocument();
    });

    it('applies the active class to the active section button', () => {
        renderSidebar('profile');
        expect(screen.getByText('Profile').closest('button')).toHaveClass('active');
        expect(screen.getByText('Subscriptions').closest('button')).not.toHaveClass('active');
        expect(screen.getByText('Export').closest('button')).not.toHaveClass('active');
    });

    it('applies the active class to subscriptions when it is the active section', () => {
        renderSidebar('subscriptions');
        expect(screen.getByText('Subscriptions').closest('button')).toHaveClass('active');
        expect(screen.getByText('Profile').closest('button')).not.toHaveClass('active');
    });

    it('applies the active class to export when it is the active section', () => {
        renderSidebar('export');
        expect(screen.getByText('Export').closest('button')).toHaveClass('active');
        expect(screen.getByText('Profile').closest('button')).not.toHaveClass('active');
    });

    it('calls setActiveSection with the correct key when Profile is clicked', () => {
        renderSidebar();
        fireEvent.click(screen.getByText('Profile'));
        expect(mockSetActiveSection).toHaveBeenCalledWith('profile');
    });

    it('calls setActiveSection with the correct key when Subscriptions is clicked', () => {
        renderSidebar();
        fireEvent.click(screen.getByText('Subscriptions'));
        expect(mockSetActiveSection).toHaveBeenCalledWith('subscriptions');
    });

    it('calls setActiveSection with the correct key when Export is clicked', () => {
        renderSidebar();
        fireEvent.click(screen.getByText('Export'));
        expect(mockSetActiveSection).toHaveBeenCalledWith('export');
    });
});