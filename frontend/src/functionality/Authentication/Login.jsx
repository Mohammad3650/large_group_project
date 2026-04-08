import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../utils/Auth/authService';
import useAuthRedirect from '../../utils/Hooks/useAuthRedirect';
import useAuthForm from '../../utils/Hooks/useAuthForm';
import AuthCard from '../../components/AuthCard';
import AuthField from '../../components/AuthField';
import './stylesheets/AuthPages.css';

/**
 * Login page component.
 *
 * Responsibilities:
 * - collects the user's email and password
 * - validates required fields
 * - submits login credentials through the auth service
 * - redirects authenticated users to the dashboard
 *
 * @returns {JSX.Element} The login page UI
 */
function Login() {
    const nav = useNavigate();

    // Stores form input values
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useAuthRedirect(nav);

    /**
     * Performs client-side validation for the login form.
     *
     * @returns {Object<string, string>} Object containing any field errors
     */
    function validateLoginForm() {
        const fieldErrors = {};

        if (!email.trim()) fieldErrors.email = 'Email is required.';
        if (!password) fieldErrors.password = 'Password is required.';

        return fieldErrors;
    }

    /**
     * Submits login data using the auth service,
     * then redirects to the dashboard.
     *
     * @returns {Promise<void>}
     */
    async function submitLogin() {
        await loginUser(email, password);
        nav('/dashboard');
    }

    const { errors, loading, handleSubmit } = useAuthForm(validateLoginForm, submitLogin);

    return (
        <div className="login-page">
            <div className="login-card-section">
                <AuthCard
                    title="Welcome Back"
                    subtitle="Log in to continue to StudySync"
                    footerText="No account?"
                    footerLinkText="Sign up"
                    footerLinkTo="/signup"
                >
                    {errors.global.length > 0 && (
                        <div className="alert alert-danger text-center" role="alert">
                            {errors.global.map((message) => (
                                <div key={message}>{message}</div>
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
                                value={email}
                                onChange={setEmail}
                                error={errors.fieldErrors.email}
                            />

                            <AuthField
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="Enter your password..."
                                value={password}
                                onChange={setPassword}
                                error={errors.fieldErrors.password}
                            />
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
                                        Logging in...
                                    </>
                                ) : (
                                    'Log in'
                                )}
                            </button>
                        </div>
                    </form>
                </AuthCard>
            </div>
        </div>
    );
}

export default Login;
