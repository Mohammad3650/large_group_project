import { CHANGE_PASSWORD_MESSAGES } from "../../../../constants/changePasswordConstants";

export function validateChangePasswordForm({ currentPassword, newPassword }) {
    const fieldErrors = {};

    if (!currentPassword) {
        fieldErrors.currentPassword = CHANGE_PASSWORD_MESSAGES.currentPasswordRequired;
    }

    if (!newPassword) {
        fieldErrors.newPassword = CHANGE_PASSWORD_MESSAGES.newPasswordRequired;
    }

    return fieldErrors;
}

