import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ChangePassword from '../ChangePassword.jsx';
import { api } from '../../../../api.js';
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../../api.js', () => ({
    api: {
        post: vi.fn()
    }
}));

describe('ChangePassword', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function renderComponent() {
        return render(
            <MemoryRouter>
                <ChangePassword />
            </MemoryRouter>
        );
    }

    it('renders the form fields and buttons', () => {
        renderComponent();

        expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument();
        expect(screen.getByText(/update your account password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });

    it('shows validation errors when both fields are empty', async () => {
        const user = userEvent.setup();

        renderComponent();

        await user.click(screen.getByRole('button', { name: /update password/i }));

        expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
    });

    it('shows only current password validation error when current password is missing', async () => {
        const user = userEvent.setup();

        renderComponent();

        await user.type(screen.getByLabelText(/new password/i), 'newpassword123');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
        expect(screen.queryByText(/new password is required/i)).not.toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
    });

    it('shows only new password validation error when new password is missing', async () => {
        const user = userEvent.setup();

        renderComponent();

        await user.type(screen.getByLabelText(/current password/i), 'oldpassword123');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
        expect(screen.queryByText(/current password is required/i)).not.toBeInTheDocument();
        expect(api.post).not.toHaveBeenCalled();
    });

    it('submits the correct payload and shows a success message', async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValue({
            data: {
                message: 'Password updated successfully'
            }
        });

        renderComponent();

        await user.type(screen.getByLabelText(/current password/i), 'oldpassword123');
        await user.type(screen.getByLabelText(/new password/i), 'newpassword123');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        expect(api.post).toHaveBeenCalledTimes(1);
        expect(api.post).toHaveBeenCalledWith('/api/user/change-password/', {
            current_password: 'oldpassword123',
            new_password: 'newpassword123'
        });

        expect(await screen.findByText(/password updated successfully/i)).toBeInTheDocument();
    });

    it('shows loading state while the request is in progress', async () => {
        const user = userEvent.setup();

        let resolveRequest;
        api.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        renderComponent();

        await user.type(screen.getByLabelText(/current password/i), 'oldpassword123');
        await user.type(screen.getByLabelText(/new password/i), 'newpassword123');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();

        resolveRequest({
            data: {
                message: 'Password updated successfully'
            }
        });

        await screen.findByText(/password updated successfully/i);
    });

    it('shows a global error when the API request fails', async () => {
        const user = userEvent.setup();
        api.post.mockRejectedValue(new Error('Request failed'));

        renderComponent();

        await user.type(screen.getByLabelText(/current password/i), 'oldpassword123');
        await user.type(screen.getByLabelText(/new password/i), 'newpassword123');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        expect(await screen.findByText(/password change failed/i)).toBeInTheDocument();
    });

    it('schedules navigation to profile after a successful password change', async () => {
        const user = userEvent.setup();
        const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

        api.post.mockResolvedValue({
            data: {
                message: 'Password updated successfully'
            }
        });

        renderComponent();

        await user.type(screen.getByLabelText(/current password/i), 'oldpassword123');
        await user.type(screen.getByLabelText(/new password/i), 'newpassword123');

        await user.click(screen.getByRole('button', { name: /update password/i }));

        expect(await screen.findByText(/password updated successfully/i)).toBeInTheDocument();

        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1200);

        const navigationTimeoutCall = setTimeoutSpy.mock.calls.find(
            ([callback, delay]) => typeof callback === 'function' && delay === 1200
        );

        expect(navigationTimeoutCall).toBeDefined();

        const scheduledCallback = navigationTimeoutCall[0];
        scheduledCallback();

        expect(mockNavigate).toHaveBeenCalledWith('/profile');

        setTimeoutSpy.mockRestore();
    });

    it('returns early if submit happens while loading is true', async () => {
        const user = userEvent.setup();

        api.post.mockImplementation(() => new Promise(() => {}));

        renderComponent();

        await user.type(screen.getByLabelText(/current password/i), 'oldpassword123');
        await user.type(screen.getByLabelText(/new password/i), 'newpassword123');

        const form = screen.getByRole('button', { name: /update password/i }).closest('form');

        fireEvent.submit(form);
        fireEvent.submit(form);

        expect(api.post).toHaveBeenCalledTimes(1);
    });
});
