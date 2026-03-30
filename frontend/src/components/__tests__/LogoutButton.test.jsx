import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogoutButton from '../LogoutButton';
import { logout } from '../../utils/Auth/authStorage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../../utils/Auth/authStorage', () => ({
    logout: vi.fn()
}));

describe('Tests for LogoutButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the logout button', () => {
        render(<LogoutButton />);

        expect(
            screen.getByRole('button', { name: /logout/i })
        ).toBeInTheDocument();
    });

    it('logs the user out and redirects to login when clicked', async () => {
        const user = userEvent.setup();

        render(<LogoutButton />);

        const button = screen.getByRole('button', { name: /logout/i });
        await user.click(button);

        expect(logout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
