import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from '../../Navbar/Navbar.jsx';

vi.mock('../../Navbar/NavbarBrand.jsx', () => ({
    default: () => <div data-testid="navbar-brand" />,
}));
vi.mock('../../Navbar/NavbarLinks.jsx', () => ({
    default: () => <div data-testid="navbar-links" />,
}));
vi.mock('../../Navbar/NavbarUserButton.jsx', () => ({
    default: () => <div data-testid="navbar-user-button" />,
}));
vi.mock('../../ToggleDarkMode.jsx', () => ({
    default: () => <div data-testid="toggle-dark-mode" />,
}));
vi.mock('../../../utils/Auth/authStatus.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useUsername.js', () => ({ default: vi.fn() }));
vi.mock('../../stylesheets/Navbar/Navbar.css', () => ({}));

import * as useAuthStatusModule from '../../../utils/Auth/authStatus.js';
import * as useUsernameModule from '../../../utils/Hooks/useUsername.js';

const renderNavbar = (props = {}) =>
    render(<Navbar theme="light" toggleTheme={vi.fn()} {...props} />);

describe('Navbar component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useUsernameModule.default.mockReturnValue({ username: 'testuser' });
    });

    it('renders the brand and theme toggle', () => {
        useAuthStatusModule.default.mockReturnValue(false);
        renderNavbar();
        expect(screen.getByTestId('navbar-brand')).toBeInTheDocument();
        expect(screen.getByTestId('toggle-dark-mode')).toBeInTheDocument();
    });

    it('renders the tagline when not logged in', () => {
        useAuthStatusModule.default.mockReturnValue(false);
        renderNavbar();
        expect(screen.getByText('Built for Students')).toBeInTheDocument();
    });

    it('does not render nav links or user button when not logged in', () => {
        useAuthStatusModule.default.mockReturnValue(false);
        renderNavbar();
        expect(screen.queryByTestId('navbar-links')).not.toBeInTheDocument();
        expect(screen.queryByTestId('navbar-user-button')).not.toBeInTheDocument();
    });

    it('renders nav links and user button when logged in', () => {
        useAuthStatusModule.default.mockReturnValue(true);
        renderNavbar();
        expect(screen.getByTestId('navbar-links')).toBeInTheDocument();
        expect(screen.getByTestId('navbar-user-button')).toBeInTheDocument();
    });

    it('does not render the tagline when logged in', () => {
        useAuthStatusModule.default.mockReturnValue(true);
        renderNavbar();
        expect(screen.queryByText('Built for Students')).not.toBeInTheDocument();
    });
});