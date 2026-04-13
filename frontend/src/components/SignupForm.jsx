import AuthErrorAlert from "./AuthErrorAlert";
import AuthField from "./AuthField";
import AuthSubmitButton from "./AuthSubmitButton";
import signupFormFields from "../functionality/Authentication/utils/signupFormFields";

/**
 * Renders a single signup form field
 * 
 * @param {Object} props - Component props
 * @param {Object} props.field - Field configuration
 * @param {string|string[]} props.error - Validation error for the field
 * @param {Object} props.fieldProps - Input props returned by getFieldProps
 * @returns {JSX.Element} Signup field UI
 */

function SignupFormField({ field, error, fieldProps }) {
    return (
        <div className="field.wrapperClassName">
            <AuthField
                name={field.name}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                error={error}
                {...fieldProps}
            />
        </div>
    );
}

/** 
 * Presentational signup form
 * 
 * Responsibilities:
 * - displays global signup errors
 * - renders signup input fields
 * - renders the submit button
 * 
 * @param {Object} props - Component props
 * @param {Function} props.getFieldProps - Returns input props for a field
 * @param {Object} props.errors - Form validation and API errors
 * @param {boolean} props.loading - Whether the form is submitting
 * @param {Function} props.onSubmit - Form submit handler
 * @returns {JSX.Element} Signup form UI
 */

function SignupForm({
    getFieldProps,
    errors,
    loading,
    onSubmit
}) {
    return (
        <>
            <AuthErrorAlert messages={errors.global} />

            <form noValidate onSubmit={onSubmit}>
                <div className="row g-3">
                    {signupFormFields.map((field) => (
                        <SignupFormField
                            key={field.name}
                            field={field}
                            error={errors.fieldErrors[field.errorKey]}
                            fieldProps={getFieldProps(field.propName)}
                        />
                    ))}
                </div>

                <div className="d-grid mt-4">
                    <AuthSubmitButton
                        loading={loading}
                        text="Sign up"
                        loadingText="Signing up..."
                    />
                </div>

            </form>
        </>
    )
}

export default SignupForm;