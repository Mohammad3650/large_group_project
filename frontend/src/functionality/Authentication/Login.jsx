import useAuthRedirect from './utils/useAuthRedirect';
import AuthCard from '../../components/AuthCard';
import useLoginForm from './utils/useLoginForm';
import LoginForm from '../../components/LoginForm';
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
    useAuthRedirect();

    const {
        email,
        setEmail,
        password,
        setPassword,
        errors,
        loading,
        handleSubmit
    } = useLoginForm();

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
                    <LoginForm
                        email={email}
                        onEmailChange={setEmail}
                        password={password}
                        onPasswordChange={setPassword}
                        errors={errors}
                        loading={loading}
                        onSubmit={handleSubmit}
                    />
                </AuthCard>
            </div>
        </div>
    );
}

export default Login;