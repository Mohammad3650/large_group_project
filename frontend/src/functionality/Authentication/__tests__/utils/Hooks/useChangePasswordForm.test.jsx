import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../../../../api.js';
import useChangePasswordForm from '../../../utils/Hooks/useChangePasswordForm.js';
import { validateChangePasswordForm } from '../../../utils/Validation/validateChangePasswordForm.js';
import useDelayedRedirect from '../../../utils/Hooks/useDelayedRedirect.js';
import {
    CHANGE_PASSWORD_MESSAGES,
    PASSWORD_CHANGE_REDIRECT_DELAY_MS
} from '../../../constants/changePasswordConstants.js';

vi.mock('../../../../../api.js', () => ({
    api: {
        post: vi.fn()
    }
}));

vi.mock('../../../utils/Validation/validateChangePasswordForm.js', () => ({
    validateChangePasswordForm: vi.fn()
}));

vi.mock('../../../utils/Hooks/useDelayedRedirect.js', () => ({
    default: vi.fn()
}));

function createSubmitEvent() {
    return {
        preventDefault: vi.fn()
    };
}

describe('useChangePasswordForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns the initial form state', () => {
        const { result } = renderHook(() => useChangePasswordForm());

        expect(result.current.currentPassword).toBe('');
        expect(result.current.newPassword).toBe('');
        expect(result.current.message).toBe('');
        expect(result.current.loading).toBe(false);
        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: []
        });

        expect(useDelayedRedirect).toHaveBeenCalledWith(
            '',
            '/profile',
            PASSWORD_CHANGE_REDIRECT_DELAY_MS
        );
    });

    it('updates current and new password fields', () => {
        const { result } = renderHook(() => useChangePasswordForm());

        act(() => {
            result.current.setCurrentPassword('oldpassword123');
            result.current.setNewPassword('newpassword123');
        });

        expect(result.current.currentPassword).toBe('oldpassword123');
        expect(result.current.newPassword).toBe('newpassword123');
    });

    it('sets validation errors and does not submit when validation fails', async () => {
        validateChangePasswordForm.mockReturnValue({
            currentPassword: 'Current password is required.',
            newPassword: 'New password is required.'
        });

        const event = createSubmitEvent();

        const { result } = renderHook(() => useChangePasswordForm());

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(validateChangePasswordForm).toHaveBeenCalledWith({
            currentPassword: '',
            newPassword: ''
        });
        expect(api.post).not.toHaveBeenCalled();
        expect(result.current.errors).toEqual({
            fieldErrors: {
                currentPassword: 'Current password is required.',
                newPassword: 'New password is required.'
            },
            global: []
        });
    });

    it('submits the correct payload and stores the success message', async () => {
        validateChangePasswordForm.mockReturnValue({});
        api.post.mockResolvedValue({
            data: {
                message: 'Password updated successfully.'
            }
        });

        const event = createSubmitEvent();

        const { result } = renderHook(() => useChangePasswordForm());

        act(() => {
            result.current.setCurrentPassword('oldpassword123');
            result.current.setNewPassword('newpassword123');
        });

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(api.post).toHaveBeenCalledTimes(1);
        expect(api.post).toHaveBeenCalledWith('/api/user/change-password/', {
            current_password: 'oldpassword123',
            new_password: 'newpassword123'
        });

        expect(result.current.message).toBe('Password updated successfully.');
        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: []
        });

        expect(useDelayedRedirect).toHaveBeenLastCalledWith(
            'Password updated successfully.',
            '/profile',
            PASSWORD_CHANGE_REDIRECT_DELAY_MS
        );
    });

    it('falls back to the default success message when the API response has no message', async () => {
        validateChangePasswordForm.mockReturnValue({});
        api.post.mockResolvedValue({
            data: {}
        });

        const event = createSubmitEvent();

        const { result } = renderHook(() => useChangePasswordForm());

        act(() => {
            result.current.setCurrentPassword('oldpassword123');
            result.current.setNewPassword('newpassword123');
        });

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(result.current.message).toBe(
            CHANGE_PASSWORD_MESSAGES.passwordChangeSuccess
        );
    });

    it('stores a global error message when the password change request fails', async () => {
        validateChangePasswordForm.mockReturnValue({});
        api.post.mockRejectedValue(new Error('Request failed'));

        const event = createSubmitEvent();

        const { result } = renderHook(() => useChangePasswordForm());

        act(() => {
            result.current.setCurrentPassword('oldpassword123');
            result.current.setNewPassword('newpassword123');
        });

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(result.current.message).toBe('');
        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: [CHANGE_PASSWORD_MESSAGES.passwordChangeFailed]
        });
    });

    it('shows loading while the request is in progress and resets it after completion', async () => {
        validateChangePasswordForm.mockReturnValue({});

        let resolveRequest;
        api.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        const event = createSubmitEvent();

        const { result } = renderHook(() => useChangePasswordForm());

        act(() => {
            result.current.setCurrentPassword('oldpassword123');
            result.current.setNewPassword('newpassword123');
        });

        act(() => {
            void result.current.handleSubmit(event);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        await act(async () => {
            resolveRequest({
                data: {
                    message: 'Password updated successfully.'
                }
            });
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('returns early when submit is triggered while already loading', async () => {
        validateChangePasswordForm.mockReturnValue({});

        let resolveRequest;
        api.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        const eventOne = createSubmitEvent();
        const eventTwo = createSubmitEvent();

        const { result } = renderHook(() => useChangePasswordForm());

        act(() => {
            result.current.setCurrentPassword('oldpassword123');
            result.current.setNewPassword('newpassword123');
        });

        act(() => {
            void result.current.handleSubmit(eventOne);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        act(() => {
            void result.current.handleSubmit(eventTwo);
        });

        expect(api.post).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveRequest({
                data: {
                    message: 'Password updated successfully.'
                }
            });
        });
    });
});