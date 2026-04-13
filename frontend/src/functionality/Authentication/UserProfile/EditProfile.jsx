import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api.js';
import AuthCard from '../../../components/AuthCard.jsx';
import AuthField from '../../../components/AuthField.jsx';

const initialErrors = {
    fieldErrors: {},
    global: []
};

const defaultProfileForm = {
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone_number: ''
};

function buildProfileForm(data) {
    return {
        email: data.email || '',
        username: data.username || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || ''
    };
}

function buildGlobalErrorState(message) {
    return {
        fieldErrors: {},
        global: [message]
    };
}

function buildFieldErrorState(data) {
    const fieldErrors = {};

    Object.entries(data).forEach(([field, value]) => {
        fieldErrors[field] = Array.isArray(value) ? value[0] : String(value);
    });

    return {
        fieldErrors,
        global: []
    };
}

function isUnauthorisedError(error) {
    return error?.response?.status === 401;
}

function hasObjectErrorData(error) {
    return Boolean(error?.response?.data && typeof error.response.data === 'object');
}

function EditProfile() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(defaultProfileForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState(initialErrors);

    useEffect(() => {
        async function fetchUserDetails() {
            try {
                const response = await api.get('/api/user/');
                setFormData(buildProfileForm(response.data));
            } catch (error) {
                if (isUnauthorisedError(error)) {
                    navigate('/login');
                    return;
                }

                setErrors(buildGlobalErrorState('Failed to load profile details.'));
            } finally {
                setLoading(false);
            }
        }

        fetchUserDetails();
    }, [navigate]);

    function updateField(name, value) {
        setFormData((previousFormData) => ({
            ...previousFormData,
            [name]: value
        }));
    }

    async function deleteAccount() {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete your account?'
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await api.delete('/api/user/delete/');
            localStorage.clear();
            window.location.href = '/';
        } catch {
            setErrors(buildGlobalErrorState('Failed to delete account.'));
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (saving) {
            return;
        }

        setSaving(true);
        setSuccessMessage('');
        setErrors(initialErrors);

        try {
            const response = await api.put('/api/user/', formData);
            setFormData(buildProfileForm(response.data));
            setSuccessMessage('Profile updated successfully.');
        } catch (error) {
            if (isUnauthorisedError(error)) {
                navigate('/login');
                return;
            }

            if (hasObjectErrorData(error)) {
                setErrors(buildFieldErrorState(error.response.data));
            } else {
                setErrors(buildGlobalErrorState('Failed to update profile.'));
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <AuthCard
                title="Edit Profile"
                subtitle="Update your account details"
                footerText="Back to"
                footerLinkText="Dashboard"
                footerLinkTo="/dashboard"
            >
                <p className="text-center mb-0">Loading profile...</p>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Edit Profile"
            subtitle="Update your account details"
            footerText="Back to"
            footerLinkText="Settings"
            footerLinkTo="/settings"
        >
            {successMessage && (
                <div className="alert alert-success text-center">
                    {successMessage}
                </div>
            )}

            {errors.global.length > 0 && (
                <div className="alert alert-danger text-center">
                    {errors.global.map((error) => (
                        <div key={error}>{error}</div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                    <AuthField
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(value) => updateField('email', value)}
                        error={errors.fieldErrors.email}
                    />

                    <AuthField
                        name="username"
                        label="Username"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(value) => updateField('username', value)}
                        error={errors.fieldErrors.username}
                    />

                    <div className="col-12 col-md-6">
                        <AuthField
                            name="first_name"
                            label="First name"
                            placeholder="First name"
                            value={formData.first_name}
                            onChange={(value) => updateField('first_name', value)}
                            error={errors.fieldErrors.first_name}
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <AuthField
                            name="last_name"
                            label="Last name"
                            placeholder="Last name"
                            value={formData.last_name}
                            onChange={(value) => updateField('last_name', value)}
                            error={errors.fieldErrors.last_name}
                        />
                    </div>

                    <AuthField
                        name="phone_number"
                        label="Phone number"
                        placeholder="e.g. 07123 456 789"
                        value={formData.phone_number}
                        onChange={(value) => updateField('phone_number', value)}
                        error={errors.fieldErrors.phone_number}
                    />
                </div>

                <div className="d-grid gap-2 mt-4">
                    <button
                        type="submit"
                        className="btn btn-dark rounded-3"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-dark rounded-3"
                        onClick={() => navigate('/change-password')}
                    >
                        Change Password
                    </button>

                    <button
                        type="button"
                        className="btn btn-danger rounded-3"
                        aria-label="Delete your account permanently"
                        onClick={deleteAccount}
                    >
                        Delete Account
                    </button>
                </div>
            </form>
        </AuthCard>
    );
}

export default EditProfile;