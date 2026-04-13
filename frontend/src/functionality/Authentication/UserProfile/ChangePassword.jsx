import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api.js';
import AuthCard from '../../../components/AuthCard.jsx';
import AuthField from '../../../components/AuthField.jsx';

const initialErrors = {
    fieldErrors: {},
    global: []
};

const PASSWORD_CHANGE_REDIRECT_DELAY_MS = 1200;

const MESSAGES = {
    currentPasswordRequired: 'Current password is required.',
    newPasswordRequired: 'New password is required.',
    passwordChangeFailed: 'Password change failed.',
    passwordChangeSuccess: 'Password updated successfully.'
};

function buildFieldErrorState(fieldErrors) {
    return {
        fieldErrors,
        global: []
    };
}

function buildGlobalErrorState(message) {
    return {
        fieldErrors: {},
        global: [message]
    };
}

function hasFieldErrors(fieldErrors) {
    return Object.keys(fieldErrors).length > 0;
}

function validateForm(currentPassword, newPassword) {
    const fieldErrors = {};

    if (!currentPassword) {
        fieldErrors.currentPassword = MESSAGES.currentPasswordRequired;
    }

    if (!newPassword) {
        fieldErrors.newPassword = MESSAGES.newPasswordRequired;
    }

    return fieldErrors;
}

function ChangePassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!message) {
            return;
        }

        const timer = setTimeout(() => {
            navigate('/profile');
        }, PASSWORD_CHANGE_REDIRECT_DELAY_MS);

        return () => clearTimeout(timer);
    }, [message, navigate]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) {
            return;
        }

        const fieldErrors = validateForm(currentPassword, newPassword);

        if (hasFieldErrors(fieldErrors)) {
            setErrors(buildFieldErrorState(fieldErrors));
            return;
        }

        setErrors(initialErrors);
        setMessage('');
        setLoading(true);

        try {
            const response = await api.post('/api/user/change-password/', {
                current_password: currentPassword,
                new_password: newPassword
            });

            setMessage(response.data.message || MESSAGES.passwordChangeSuccess);
        } catch {
            setErrors(buildGlobalErrorState(MESSAGES.passwordChangeFailed));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard
            title="Change Password"
            subtitle="Update your account password"
            footerText="Back to"
            footerLinkText="Settings"
            footerLinkTo="/settings"
        >
            {errors.global.length > 0 && (
                <div className="alert alert-danger text-center">
                    {errors.global.map((error) => (
                        <div key={error}>{error}</div>
                    ))}
                </div>
            )}

            {message && (
                <div className="alert alert-success text-center">{message}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                    <AuthField
                        name="currentPassword"
                        label="Current password"
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        error={errors.fieldErrors.currentPassword}
                    />

                    <AuthField
                        name="newPassword"
                        label="New password"
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={setNewPassword}
                        error={errors.fieldErrors.newPassword}
                    />
                </div>

                <div className="d-grid mt-4">
                    <button
                        type="submit"
                        className="btn btn-dark rounded-3"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </AuthCard>
    );
}

export default ChangePassword;