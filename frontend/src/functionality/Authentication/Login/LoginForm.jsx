import AuthErrorAlert from "../AuthComponents/AuthErrorAlert";
import AuthField from "../AuthComponents/AuthField";
import AuthSubmitButton from "../AuthComponents/AuthSubmitButton";

/**
 * Presentational login form
 * 
 * Responsibilities:
 * - renders login field inputs
 * - displays field and global validation errors
 * - renders the submit button
 *
 * @param {Object} props - Component props
 * @param {string} props.email - Current email value
 * @param {Function} props.onEmailChange - Updates the email value
 * @param {string} props.password - Current password value
 * @param {Function} props.onPasswordChange - Updates the password value
 * @param {Object} props.errors - Form validation and API errors
 * @param {boolean} props.loading - Whether the form is submitting
 * @param {Function} props.onSubmit - Form submit handler
 * @returns {JSX.Element} The login form UI
 */

function LoginForm({
    email,
    onEmailChange,
    password,
    onPasswordChange,
    errors,
    loading,
    onSubmit
}) {
    return (
        <>
            <AuthErrorAlert messages={errors.global} />

            <form onSubmit={onSubmit} noValidate>
                <div className="row g-3">
                    <AuthField
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={onEmailChange}
                        error={errors.fieldErrors.email}
                    />
                    <AuthField
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Enter your password..."
                        value={password}
                        onChange={onPasswordChange}
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
        </>
    );
}

export default LoginForm;