import { useNavigate } from 'react-router-dom';
import useAuthRedirect from '../../utils/Hooks/useAuthRedirect';
import AuthCard from '../../components/AuthCard';
import AuthField from '../../components/AuthField';
import AuthSubmitButton from '../../components/AuthSubmitButton';
import useSignupForm from '../../utils/Hooks/useSignupForm';
import AuthErrorAlert from '../../components/AuthErrorAlert';
import './stylesheets/AuthPages.css';
import SignupForm from '../../components/SignupForm';

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
    const navigate = useNavigate();

    useAuthRedirect(navigate);

    const {
        getFieldProps,
        errors,
        loading,
        handleSubmit,
    } = useSignupForm(navigate);

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
