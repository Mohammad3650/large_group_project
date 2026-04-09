import { useNavigate } from 'react-router-dom';
import useAuthRedirect from '../../utils/Hooks/useAuthRedirect';
import AuthCard from '../../components/AuthCard';
import AuthField from '../../components/AuthField';
import './stylesheets/AuthPages.css';
import useLoginForm from '../../utils/Hooks/useLoginForm';
import AuthErrorAlert from '../../components/AuthErrorAlert';
import AuthSubmitButton from '../../components/AuthSubmitButton';

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

    useAuthRedirect(nav);

    const {
        email,
        setEmail,
        password,
        setPassword,
        errors,
        loading,
        handleSubmit
    } = useLoginForm(nav);


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

                    <AuthErrorAlert messages={errors.global} />

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
                            <AuthSubmitButton
                                loading={loading}
                                text="Log in"
                                loadingText="Logging in..."
                            />
                        </div>
                    </form>
                </AuthCard>
            </div>
        </div>
    );
}

export default Login;
