import { describe, it, expect, vi } from 'vitest';
import { validateChangePasswordForm } from '../../../utils/Validation/validateChangePasswordForm.js';
import { CHANGE_PASSWORD_MESSAGES } from '../../../constants/changePasswordConstants.js';

vi.mock('../../../constants/changePasswordConstants.js', () => ({
    CHANGE_PASSWORD_MESSAGES: {
        currentPasswordRequired: 'Current password is required.',
        newPasswordRequired: 'New password is required.',
        confirmNewPasswordRequired: 'Please confirm your new password.',
        newPasswordMismatch: 'New passwords do not match.'
    }
}));

describe('validateChangePasswordForm', () => {
    it('returns no errors when all fields are provided and passwords match', () => {
        const result = validateChangePasswordForm({
            currentPassword: 'oldPassword123',
            newPassword: 'newPassword123',
            confirmNewPassword: 'newPassword123'
        });

        expect(result).toEqual({});
    });

    it('returns an error when currentPassword is missing', () => {
        const result = validateChangePasswordForm({
            currentPassword: '',
            newPassword: 'newPassword123',
            confirmNewPassword: 'newPassword123'
        });

        expect(result).toEqual({
            currentPassword: CHANGE_PASSWORD_MESSAGES.currentPasswordRequired
        });
    });

    it('returns an error when newPassword is missing', () => {
        const result = validateChangePasswordForm({
            currentPassword: 'oldPassword123',
            newPassword: '',
            confirmNewPassword: 'newPassword123'
        });

        expect(result).toEqual({
            newPassword: CHANGE_PASSWORD_MESSAGES.newPasswordRequired
        });
    });

    it('returns an error when confirmNewPassword is missing', () => {
        const result = validateChangePasswordForm({
            currentPassword: 'oldPassword123',
            newPassword: 'newPassword123',
            confirmNewPassword: ''
        });

        expect(result).toEqual({
            confirmNewPassword:
                CHANGE_PASSWORD_MESSAGES.confirmNewPasswordRequired
        });
    });

    it('returns mismatch errors when newPassword and confirmNewPassword do not match', () => {
        const result = validateChangePasswordForm({
            currentPassword: 'oldPassword123',
            newPassword: 'newPassword123',
            confirmNewPassword: 'differentPassword123'
        });

        expect(result).toEqual({
            newPassword: CHANGE_PASSWORD_MESSAGES.newPasswordMismatch,
            confirmNewPassword: CHANGE_PASSWORD_MESSAGES.newPasswordMismatch
        });
    });

    it('returns errors when all fields are missing', () => {
        const result = validateChangePasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        });

        expect(result).toEqual({
            currentPassword: CHANGE_PASSWORD_MESSAGES.currentPasswordRequired,
            newPassword: CHANGE_PASSWORD_MESSAGES.newPasswordRequired,
            confirmNewPassword:
                CHANGE_PASSWORD_MESSAGES.confirmNewPasswordRequired
        });
    });

    it('treats undefined values as missing fields', () => {
        const result = validateChangePasswordForm({
            currentPassword: undefined,
            newPassword: undefined,
            confirmNewPassword: undefined
        });

        expect(result).toEqual({
            currentPassword: CHANGE_PASSWORD_MESSAGES.currentPasswordRequired,
            newPassword: CHANGE_PASSWORD_MESSAGES.newPasswordRequired,
            confirmNewPassword:
                CHANGE_PASSWORD_MESSAGES.confirmNewPasswordRequired
        });
    });
});