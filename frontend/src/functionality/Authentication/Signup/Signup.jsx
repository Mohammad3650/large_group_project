import useAuthRedirect from '../utils/Hooks/useAuthRedirect.js';
import AuthCard from '../AuthComponents/AuthCard.jsx';
import useSignupForm from '../utils/Hooks/useSignupForm.js';
import SignupForm from './SignupForm.jsx';
import '../stylesheets/AuthPages.css';

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
    useAuthRedirect();

    const {
        getFieldProps,
        errors,
        loading,
        handleSubmit
    } = useSignupForm();

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
                    <SignupForm
                        getFieldProps={getFieldProps}
                        errors={errors}
                        loading={loading}
                        onSubmit={handleSubmit}
                    />
                </AuthCard>
            </div>
        </div>
    );
}

export default Signup;