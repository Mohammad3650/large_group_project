import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api.js';
import AuthCard from '../../../components/AuthCard.jsx';
import AuthField from '../../../components/AuthField.jsx';

const initialErrors = {
    fieldErrors: {},
    global: []
};

const MESSAGES = {
    currentPasswordRequired: 'Current password is required.',
    newPasswordRequired: 'New password is required.',
    passwordChangeFailed: 'Password change failed.'
};

function ChangePassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            navigate('/profile');
        }, 1200);

        return () => clearTimeout(timer);
    }, [message, navigate]);

    function validateForm() {
        const fieldErrors = {};

        if (!currentPassword) {
            fieldErrors.currentPassword = MESSAGES.currentPasswordRequired;
        }

        if (!newPassword) {
            fieldErrors.newPassword = MESSAGES.newPasswordRequired;
        }

        return fieldErrors;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (loading) return;

        const fieldErrors = validateForm();
        if (Object.keys(fieldErrors).length) {
            setErrors({ fieldErrors, global: [] });
            return;
        }

        setErrors(initialErrors);
        setMessage('');
        setLoading(true);

        try {
            const res = await api.post('/api/user/change-password/', {
                current_password: currentPassword,
                new_password: newPassword
            });

            setMessage(res.data.message);
        } catch {
            setErrors({
                fieldErrors: {},
                global: [MESSAGES.passwordChangeFailed]
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard
            title="Change Password"
            subtitle="Update your account password"
            footerText="Back to"
            footerLinkText="Profile"
            footerLinkTo="/profile"
        >
            {errors.global.length > 0 && (
                <div className="alert alert-danger text-center">
                    {errors.global.map((error) => (
                        <div key={error}>{error}</div>
                    ))}
                </div>
            )}

            {message && <div className="alert alert-success text-center">{message}</div>}

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
                    <button type="submit" className="btn btn-dark rounded-3" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </AuthCard>
    );
}

export default ChangePassword;
