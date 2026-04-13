import AuthErrorAlert from "../AuthComponents/AuthErrorAlert";
import AuthField from "../AuthComponents/AuthField";
import AuthSubmitButton from "../AuthComponents/AuthSubmitButton";
import signupFormFields from "../utils/FormFields/signupFormFields";

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
                    {signupFormFields.map((field) => {
                        return (
                            <div key={field.name} className={field.wrapperClassName}>
                                <AuthField
                                    name={field.name}
                                    label={field.label}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    error={errors.fieldErrors[field.name]}
                                    {...getFieldProps(field.name)}
                                />
                            </div>
                        );
                    })}
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