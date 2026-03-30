import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api.js';
import AuthCard from '../../../components/AuthCard.jsx';
import AuthField from '../../../components/AuthField.jsx';

const initialErrors = {
    fieldErrors: {},
    global: []
};

function EditProfile() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        phone_number: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState(initialErrors);

    useEffect(() => {
        async function fetchUserDetails() {
            try {
                const res = await api.get('/api/user/');
                setFormData({
                    email: res.data.email || '',
                    username: res.data.username || '',
                    first_name: res.data.first_name || '',
                    last_name: res.data.last_name || '',
                    phone_number: res.data.phone_number || ''
                });
            } catch (err) {
                if (err?.response?.status === 401) {
                    navigate('/login');
                } else {
                    setErrors({
                        fieldErrors: {},
                        global: ['Failed to load profile details.']
                    });
                }
            } finally {
                setLoading(false);
            }
        }

        fetchUserDetails();
    }, [navigate]);

    function updateField(name, value) {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    async function deleteAccount() {
        const confirmDelete = window.confirm('Are you sure you want to delete your account?');

        if (!confirmDelete) return;

        try {
            await api.delete('/api/user/delete/');
            localStorage.clear();
            window.location.href = '/';
        } catch {
            setErrors({
                fieldErrors: {},
                global: ['Failed to delete account.']
            });
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (saving) return;

        setSaving(true);
        setSuccessMessage('');
        setErrors(initialErrors);

        try {
            const res = await api.put('/api/user/', formData);
            setFormData({
                email: res.data.email || '',
                username: res.data.username || '',
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || '',
                phone_number: res.data.phone_number || ''
            });
            setSuccessMessage('Profile updated successfully.');
        } catch (err) {
            const data = err?.response?.data;

            if (err?.response?.status === 401) {
                navigate('/login');
            } else if (data && typeof data === 'object') {
                const fieldErrors = {};

                for (const [field, value] of Object.entries(data)) {
                    fieldErrors[field] = Array.isArray(value) ? value[0] : String(value);
                }

                setErrors({ fieldErrors, global: [] });
            } else {
                setErrors({
                    fieldErrors: {},
                    global: ['Failed to update profile.']
                });
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
            footerLinkText="Dashboard"
            footerLinkTo="/dashboard"
        >
            {successMessage && (
                <div className="alert alert-success text-center">{successMessage}</div>
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
                    <button type="submit" className="btn btn-dark rounded-3" disabled={saving}>
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
