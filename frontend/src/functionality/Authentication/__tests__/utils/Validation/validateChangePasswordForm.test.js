import { describe, it, expect, vi } from 'vitest';
import { validateChangePasswordForm } from '../../../utils/Validation/validateChangePasswordForm.js';
import { CHANGE_PASSWORD_MESSAGES } from '../../../constants/changePasswordConstants.js';

vi.mock('../../../constants/changePasswordConstants.js', () => ({
    CHANGE_PASSWORD_MESSAGES: {
        currentPasswordRequired: 'Current password is required.',
        newPasswordRequired: 'New password is required.'
    }
}));

describe('validateChangePasswordForm', () => {
    it('returns no errors when both fields are provided', () => {
        const result = validateChangePasswordForm({
            currentPassword: 'oldPassword123',
            newPassword: 'newPassword123'
        });

        expect(result).toEqual({});
    });

    it('returns an error when currentPassword is missing', () => {
        const result = validateChangePasswordForm({
            currentPassword: '',
            newPassword: 'newPassword123'
        });

        expect(result).toEqual({
            currentPassword: CHANGE_PASSWORD_MESSAGES.currentPasswordRequired
        });
    });

    it('returns an error when newPassword is missing', () => {
        const result = validateChangePasswordForm({
            currentPassword: 'oldPassword123',
            newPassword: ''
        });

        expect(result).toEqual({
            newPassword: CHANGE_PASSWORD_MESSAGES.newPasswordRequired
        });
    });

    it('returns errors when both fields are missing', () => {
        const result = validateChangePasswordForm({
            currentPassword: '',
            newPassword: ''
        });

        expect(result).toEqual({
            currentPassword: CHANGE_PASSWORD_MESSAGES.currentPasswordRequired,
            newPassword: CHANGE_PASSWORD_MESSAGES.newPasswordRequired
        });
    });

    it('treats undefined values as missing fields', () => {
        const result = validateChangePasswordForm({
            currentPassword: undefined,
            newPassword: undefined
        });

        expect(result).toEqual({
            currentPassword: CHANGE_PASSWORD_MESSAGES.currentPasswordRequired,
            newPassword: CHANGE_PASSWORD_MESSAGES.newPasswordRequired
        });
    });
});