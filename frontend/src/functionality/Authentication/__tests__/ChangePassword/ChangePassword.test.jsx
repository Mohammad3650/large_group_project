import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import ChangePassword from '../../ChangePassword/ChangePassword.jsx';
import useChangePasswordForm from '../../utils/Hooks/useChangePasswordForm.js';

vi.mock('../../utils/Hooks/useChangePasswordForm.js', () => ({
    default: vi.fn()
}));

function createHookState(overrides = {}) {
    return {
        currentPassword: '',
        setCurrentPassword: vi.fn(),
        newPassword: '',
        setNewPassword: vi.fn(),
        confirmNewPassword: '',
        setConfirmNewPassword: vi.fn(),
        message: '',
        errors: {
            fieldErrors: {},
            global: []
        },
        loading: false,
        handleSubmit: vi.fn((event) => event.preventDefault()),
        ...overrides
    };
}

function renderComponent() {
    return render(
        <MemoryRouter>
            <ChangePassword />
        </MemoryRouter>
    );
}

describe('ChangePassword', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form fields, button, and settings link', () => {
        useChangePasswordForm.mockReturnValue(createHookState());

        renderComponent();

        expect(
            screen.getByRole('heading', { name: /change password/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/update your account password/i)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/current password/i)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/^new password$/i)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/confirm new password/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /update password/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /settings/i })
        ).toBeInTheDocument();
    });

    it('passes the new current password value to the hook setter', () => {
        const setCurrentPassword = vi.fn();

        useChangePasswordForm.mockReturnValue(
            createHookState({ setCurrentPassword })
        );

        renderComponent();

        fireEvent.change(screen.getByLabelText(/current password/i), {
            target: { value: 'oldpassword123' }
        });

        expect(setCurrentPassword).toHaveBeenCalledWith('oldpassword123');
    });

    it('passes the new password value to the hook setter', () => {
        const setNewPassword = vi.fn();

        useChangePasswordForm.mockReturnValue(
            createHookState({ setNewPassword })
        );

        renderComponent();

        fireEvent.change(screen.getByLabelText(/^new password$/i), {
            target: { value: 'newpassword123' }
        });

        expect(setNewPassword).toHaveBeenCalledWith('newpassword123');
    });

    it('passes the confirm new password value to the hook setter', () => {
        const setConfirmNewPassword = vi.fn();

        useChangePasswordForm.mockReturnValue(
            createHookState({ setConfirmNewPassword })
        );

        renderComponent();

        fireEvent.change(screen.getByLabelText(/confirm new password/i), {
            target: { value: 'newpassword123' }
        });

        expect(setConfirmNewPassword).toHaveBeenCalledWith('newpassword123');
    });

    it('submits the form through the hook submit handler', () => {
        const handleSubmit = vi.fn((event) => event.preventDefault());

        useChangePasswordForm.mockReturnValue(
            createHookState({ handleSubmit })
        );

        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /update password/i }));

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('renders field validation errors from hook state', () => {
        useChangePasswordForm.mockReturnValue(
            createHookState({
                errors: {
                    fieldErrors: {
                        currentPassword: 'Current password is required.',
                        newPassword: 'New password is required.',
                        confirmNewPassword: 'Please confirm your new password.'
                    },
                    global: []
                }
            })
        );

        renderComponent();

        expect(
            screen.getByText(/current password is required/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/new password is required/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/please confirm your new password/i)
        ).toBeInTheDocument();
    });

    it('renders a success message from hook state', () => {
        useChangePasswordForm.mockReturnValue(
            createHookState({
                message: 'Password updated successfully.'
            })
        );

        renderComponent();

        expect(
            screen.getByText(/password updated successfully/i)
        ).toBeInTheDocument();
    });

    it('renders a global error message from hook state', () => {
        useChangePasswordForm.mockReturnValue(
            createHookState({
                errors: {
                    fieldErrors: {},
                    global: ['Password change failed.']
                }
            })
        );

        renderComponent();

        expect(
            screen.getByText(/password change failed/i)
        ).toBeInTheDocument();
    });

    it('shows the loading state from hook state', () => {
        useChangePasswordForm.mockReturnValue(
            createHookState({
                loading: true
            })
        );

        renderComponent();

        expect(
            screen.getByRole('button', { name: /updating/i })
        ).toBeDisabled();
    });
});