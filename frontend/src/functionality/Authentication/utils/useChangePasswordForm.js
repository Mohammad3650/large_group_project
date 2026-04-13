import { use, useEffect, useState } from "react";
import { api } from "../../../api.js";
import {
    CHANGE_PASSWORD_INITIAL_ERRORS,
    CHANGE_PASSWORD_MESSAGES,
    PASSWORD_CHANGE_REDIRECT_DELAY_MS
} from "../../../constants/changePasswordConstants.js";
import { validateChangePasswordForm } from "./validateChangePasswordForm.js";

function useChangePasswordForm(navigate) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState(CHANGE_PASSWORD_INITIAL_ERRORS);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            navigate('/profile');
        }, PASSWORD_CHANGE_REDIRECT_DELAY_MS);

        return () => clearTimeout(timer);
    }, [message, navigate]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        const fieldErrors = validateChangePasswordForm({
            currentPassword,
            newPassword,
        });

        if (Object.keys(fieldErrors).length) {
            setErrors({
                fieldErrors,
                global: []
            });
            return;
        }

        resetFeedback();
        await submitPasswordChange();
    }

    function resetFeedback() {
        setErrors(CHANGE_PASSWORD_INITIAL_ERRORS);
        setMessage('');
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