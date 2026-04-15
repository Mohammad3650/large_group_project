import { CHANGE_PASSWORD_MESSAGES } from "../../constants/changePasswordConstants.js";

/**
 * Validates the change password form fields and returns any errors found.
 * @param {Object} values
 * @param {string} values.currentPassword
 * @param {string} values.newPassword
 * @returns {Object} An object containing field validation errors
 */
export function validateChangePasswordForm({ currentPassword, newPassword, confirmNewPassword }) {
    const fieldErrors = {};

    if (!currentPassword) {
        fieldErrors.currentPassword = CHANGE_PASSWORD_MESSAGES.currentPasswordRequired;
    }

    if (!newPassword) {
        fieldErrors.newPassword = CHANGE_PASSWORD_MESSAGES.newPasswordRequired;
    }

    if (!confirmNewPassword) {
        fieldErrors.confirmNewPassword = CHANGE_PASSWORD_MESSAGES.confirmNewPasswordRequired;
    }

    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
        fieldErrors.newPassword = CHANGE_PASSWORD_MESSAGES.newPasswordMismatch;
        fieldErrors.confirmNewPassword = CHANGE_PASSWORD_MESSAGES.newPasswordMismatch;
    }

    return fieldErrors;
}

