import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../../utils/Auth/authService';
import { validateSignupForm } from '../../utils/Validation/signupValidation';
import useAuthRedirect from '../../utils/Hooks/useAuthRedirect';
import useAuthForm from '../../utils/Hooks/useAuthForm';
import AuthCard from '../../components/AuthCard';
import AuthField from '../../components/AuthField';
import './stylesheets/AuthPages.css';

/**
 * Initial form state used when the component loads.
 */
const initialForm = {
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
};

/**
 * Signup page component.
 *
 * Responsibilities:
 * - manages registration form state
 * - validates signup input
 * - submits signup data through the auth service
 * - redirects authenticated users to the dashboard
 *
 * @returns {JSX.Element} Signup form UI
 */
function Signup() {
    const nav = useNavigate();

    // Stores all signup form values in one object
    const [form, setForm] = useState(initialForm);

    useAuthRedirect(nav);

    /**
     * Updates a specific field in the signup form state.
     *
     * @param {string} name - Field name to update
     * @param {string} value - New value for the field
     */
    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    /**
     * Runs client-side signup validation.
     *
     * @returns {Object<string, string>} Object containing any field errors
     */
    function validateForm() {
        return validateSignupForm(form);
    }

    /**
     * Submits signup data using the auth service,
     * then redirects to the dashboard.
     *
     * @returns {Promise<void>}
     */
    async function submitForm() {
        await signupUser(form);
        nav('/dashboard');
    }

    const { errors, loading, handleSubmit } = useAuthForm(validateForm, submitForm);

    return (
        <div className="signup-page">
            <div className="signup-card-section">
                <AuthCard
                    title="Create your account"
                    subtitle="Sign up to get started with StudySync"
                    footerText="Already have an account?"
                    footerLinkText="Log in"
                    footerLinkTo="/login"
                >
                    {errors.global.length > 0 && (
                        <div className="alert alert-danger text-center">
                            {errors.global.map((message) => (
                                <div key={message}>{message}</div>
                            ))}
                        </div>
                    )}

                    <form noValidate onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <AuthField
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(value) => updateField('email', value)}
                                error={errors.fieldErrors.email}
                            />

                            <AuthField
                                name="username"
                                label="Username"
                                placeholder="Choose a username"
                                value={form.username}
                                onChange={(value) => updateField('username', value)}
                                error={errors.fieldErrors.username}
                            />

                            <div className="col-12 col-md-6">
                                <AuthField
                                    name="firstName"
                                    label="First name"
                                    placeholder="First name"
                                    value={form.firstName}
                                    onChange={(value) => updateField('firstName', value)}
                                    error={errors.fieldErrors.first_name}
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <AuthField
                                    name="lastName"
                                    label="Last name"
                                    placeholder="Last name"
                                    value={form.lastName}
                                    onChange={(value) => updateField('lastName', value)}
                                    error={errors.fieldErrors.last_name}
                                />
                            </div>

                            <AuthField
                                name="phoneNumber"
                                label="Phone number"
                                placeholder="e.g. 07123 456 789"
                                value={form.phoneNumber}
                                onChange={(value) => updateField('phoneNumber', value)}
                                error={errors.fieldErrors.phone_number}
                            />

                            <div className="col-12 col-md-6">
                                <AuthField
                                    name="password"
                                    label="Password"
                                    type="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={(value) => updateField('password', value)}
                                    error={errors.fieldErrors.password}
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <AuthField
                                    name="confirmPassword"
                                    label="Confirm password"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={form.confirmPassword}
                                    onChange={(value) => updateField('confirmPassword', value)}
                                    error={errors.fieldErrors.confirmPassword}
                                />
                            </div>
                        </div>

                        <div className="d-grid mt-4">
                            <button
                                className="btn btn-dark btn-lg rounded-3"
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Signing up...
                                    </>
                                ) : (
                                    'Sign up'
                                )}
                            </button>
                        </div>
                    </form>
                </AuthCard>
            </div>
        </div>
    );
}

export default Signup;
