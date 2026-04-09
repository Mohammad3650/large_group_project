import { useNavigate } from 'react-router-dom';
import useAuthRedirect from '../../utils/Hooks/useAuthRedirect';
import AuthCard from '../../components/AuthCard';
import AuthField from '../../components/AuthField';
import AuthSubmitButton from '../../components/AuthSubmitButton';
import useSignupForm from '../../utils/Hooks/useSignupForm';
import AuthErrorAlert from '../../components/AuthErrorAlert';
import './stylesheets/AuthPages.css';

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

    useAuthRedirect(nav);

    const {
        getFieldProps,
        errors,
        loading,
        handleSubmit,
    } = useSignupForm(nav);

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
                    <AuthErrorAlert messages={errors.global} />

                    <form noValidate onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <AuthField
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                error={errors.fieldErrors.email}
                                {...getFieldProps('email')}
                            />

                            <AuthField
                                name="username"
                                label="Username"
                                placeholder="Choose a username"
                                error={errors.fieldErrors.username}
                                {...getFieldProps('username')}
                            />

                            <div className="col-12 col-md-6">
                                <AuthField
                                    name="firstName"
                                    label="First name"
                                    placeholder="First name"
                                    error={errors.fieldErrors.first_name}
                                    {...getFieldProps('firstName')}
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <AuthField
                                    name="lastName"
                                    label="Last name"
                                    placeholder="Last name"
                                    error={errors.fieldErrors.last_name}
                                    {...getFieldProps('lastName')}
                                />
                            </div>

                            <AuthField
                                name="phoneNumber"
                                label="Phone number"
                                placeholder="e.g. 07123 456 789"
                                error={errors.fieldErrors.phone_number}
                                {...getFieldProps('phoneNumber')}
                            />

                            <div className="col-12 col-md-6">
                                <AuthField
                                    name="password"
                                    label="Password"
                                    type="password"
                                    placeholder="Create a password"
                                    error={errors.fieldErrors.password}
                                    {...getFieldProps('password')}
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <AuthField
                                    name="confirmPassword"
                                    label="Confirm password"
                                    type="password"
                                    placeholder="Confirm password"
                                    error={errors.fieldErrors.confirmPassword}
                                    {...getFieldProps('confirmPassword')}
                                />
                            </div>
                        </div>

                        <div className="d-grid mt-4">
                            <AuthSubmitButton
                                loading={loading}
                                text="Sign up"
                                loadingText="Signing up..."
                            />
                        </div>
                    </form>
                </AuthCard>
            </div>
        </div>
    );
}

export default Signup;
