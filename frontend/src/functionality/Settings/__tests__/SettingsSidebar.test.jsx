import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsSidebar from '../SettingsSidebar';

vi.mock('../SettingsNavItem.jsx', () => ({
    default: ({ label, isActive, onClick }) => (
        <button
            data-testid={`nav-item-${label.toLowerCase()}`}
            className={isActive ? 'active' : ''}
            onClick={onClick}
        >
            {label}
        </button>
    ),
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

    it('passes isActive true to the active nav item', () => {
        renderSidebar('profile');
        expect(screen.getByTestId('nav-item-profile')).toHaveClass('active');
        expect(screen.getByTestId('nav-item-subscriptions')).not.toHaveClass('active');
        expect(screen.getByTestId('nav-item-export')).not.toHaveClass('active');
    });

    it('passes isActive true to subscriptions when it is active', () => {
        renderSidebar('subscriptions');
        expect(screen.getByTestId('nav-item-subscriptions')).toHaveClass('active');
        expect(screen.getByTestId('nav-item-profile')).not.toHaveClass('active');
    });

    it('passes isActive true to export when it is active', () => {
        renderSidebar('export');
        expect(screen.getByTestId('nav-item-export')).toHaveClass('active');
        expect(screen.getByTestId('nav-item-profile')).not.toHaveClass('active');
    });

    it('calls setActiveSection with profile when Profile is clicked', () => {
        renderSidebar();
        fireEvent.click(screen.getByText('Profile'));
        expect(mockSetActiveSection).toHaveBeenCalledWith('profile');
    });

    it('calls setActiveSection with subscriptions when Subscriptions is clicked', () => {
        renderSidebar();
        fireEvent.click(screen.getByText('Subscriptions'));
        expect(mockSetActiveSection).toHaveBeenCalledWith('subscriptions');
    });

    it('calls setActiveSection with export when Export is clicked', () => {
        renderSidebar();
        fireEvent.click(screen.getByText('Export'));
        expect(mockSetActiveSection).toHaveBeenCalledWith('export');
    });
});