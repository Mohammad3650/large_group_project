import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api.js';
import AuthCard from '../../../components/AuthCard.jsx';
import AuthField from '../../../components/AuthField.jsx';

const initialErrors = {
    fieldErrors: {},
    global: []
};

const PASSWORD_CHANGE_FAILURE_MESSAGE = 'Password change failed.';
const PASSWORD_CHANGE_SUCCESS_MESSAGE = 'Password updated successfully.';
const PASSWORD_CHANGE_REDIRECT_DELAY_MS = 1200;

function ChangePassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!message) return;

        const timeoutId = setTimeout(() => {
            navigate('/profile');
        }, PASSWORD_CHANGE_REDIRECT_DELAY_MS);

        return () => clearTimeout(timeoutId);
    }, [message, navigate]);

    function validateForm() {
        const fieldErrors = {};

        if (!currentPassword) {
            fieldErrors.currentPassword = 'Current password is required.';
        }

        if (!newPassword) {
            fieldErrors.newPassword = 'New password is required.';
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

            setMessage(res.data.message || PASSWORD_CHANGE_SUCCESS_MESSAGE);
        } catch {
            setErrors({
                fieldErrors: {},
                global: [PASSWORD_CHANGE_FAILURE_MESSAGE]
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
                        className="btn btn-dark btn-lg rounded-3"
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
