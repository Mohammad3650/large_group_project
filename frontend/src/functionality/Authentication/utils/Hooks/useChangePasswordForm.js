import { useState } from 'react';
import { api } from '../../../../api.js';
import {
    CHANGE_PASSWORD_MESSAGES,
    PASSWORD_CHANGE_REDIRECT_DELAY_MS
} from '../../constants/changePasswordConstants.js';
import { validateChangePasswordForm } from '../Validation/validateChangePasswordForm.js';
import useDelayedRedirect from './useDelayedRedirect.js';
import { createInitialErrors } from '../errors.js';

/**
 * Manages change password form state, validation, submission and redirect behaviour
 * @returns {{
 *  currentPassword: string,
 *  newPassword: string,
 *  setCurrentPassword: function,
 *  setNewPassword: function,
 *  message: string,
 *  errors: { fieldErrors: Object<string, string>, global: string[] },
 *  loading: boolean,
 *  handleSubmit: function
 * }}
 */
function useChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState(createInitialErrors);
    const [loading, setLoading] = useState(false);

    useDelayedRedirect(
        message,
        '/profile',
        PASSWORD_CHANGE_REDIRECT_DELAY_MS
    );

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        const fieldErrors = validateChangePasswordForm({
            currentPassword,
            newPassword
        });

        if (Object.keys(fieldErrors).length > 0) {
            setErrors({
                fieldErrors,
                global: []
            });
            return;
        }

        setErrors({
            fieldErrors: {},
            global: []
        });
        setMessage('');

        await submitPasswordChange();
    }

    async function submitPasswordChange() {
        setLoading(true);

        try {
            const res = await api.post('/api/user/change-password/', {
                current_password: currentPassword,
                new_password: newPassword
            });

            setMessage(res.data.message || CHANGE_PASSWORD_MESSAGES.passwordChangeSuccess);
        } catch {
            setErrors({
                fieldErrors: {},
                global: [CHANGE_PASSWORD_MESSAGES.passwordChangeFailed]
            });
        } finally {
            setLoading(false);
        }
    }

    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        message,
        errors,
        loading,
        handleSubmit
    };
}

export default useChangePasswordForm;
