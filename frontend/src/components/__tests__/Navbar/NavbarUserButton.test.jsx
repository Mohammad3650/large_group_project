import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NavbarUserButton from '../../Navbar/NavbarUserButton.jsx';

vi.mock('../../stylesheets/Navbar/NavbarUserButton.css', () => ({}));
vi.mock('../../../utils/Hooks/useDropdown.js', () => ({ default: vi.fn() }));
vi.mock('../../utils/Hooks/useCloseOnAuthChange.js', () => ({ default: vi.fn() }));
vi.mock('../../Navbar/NavbarUserDropdown.jsx', () => ({
    default: ({ onClose }) => (
        <div data-testid="navbar-user-dropdown">
            <button onClick={onClose}>Close</button>
        </div>
    ),
}));
vi.mock('react-icons/fa', () => ({
    FaUserCircle: ({ className, onClick }) => (
        <svg data-testid="user-icon" className={className} onClick={onClick} />
    ),
}));

import * as useDropdownModule from '../../../utils/Hooks/useDropdown.js';

const mockSetDropdownOpen = vi.fn();

const defaultProps = {
    username: 'testuser',
    isLoggedIn: true,
};

const renderButton = (props = {}) =>
    render(<NavbarUserButton {...defaultProps} {...props} />);

describe('NavbarUserButton component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: false,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
    });

    it('renders the user icon', () => {
        renderButton();
        expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('does not apply the active class when dropdown is closed', () => {
        renderButton();
        expect(screen.getByTestId('user-icon')).not.toHaveClass('active');
    });

    it('applies the active class when dropdown is open', () => {
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: true,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderButton();
        expect(screen.getByTestId('user-icon')).toHaveClass('active');
    });

    it('does not render the dropdown by default', () => {
        renderButton();
        expect(screen.queryByTestId('navbar-user-dropdown')).not.toBeInTheDocument();
    });

    it('renders the dropdown when dropdownOpen is true', () => {
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: true,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderButton();
        expect(screen.getByTestId('navbar-user-dropdown')).toBeInTheDocument();
    });

    it('calls setDropdownOpen with a toggle function when the user icon is clicked', () => {
        const localSetDropdownOpen = vi.fn();
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: false,
            setDropdownOpen: localSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderButton();
        fireEvent.click(screen.getByTestId('user-icon'));
        expect(localSetDropdownOpen).toHaveBeenCalledOnce();
        const toggleFn = localSetDropdownOpen.mock.calls[0][0];
        expect(toggleFn(false)).toBe(true);
        expect(toggleFn(true)).toBe(false);
    });

    it('closes the dropdown when onClose is called', () => {
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: true,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderButton();
        fireEvent.click(screen.getByText('Close'));
        expect(mockSetDropdownOpen).toHaveBeenCalledWith(false);
    });
});