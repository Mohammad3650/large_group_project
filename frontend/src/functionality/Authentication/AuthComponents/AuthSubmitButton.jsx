/**
 * Reusable submit button for Authentication form
 *
 * @param {Object} props
 * @param {boolean} props.loading - Whether the form is currently submitting
 * @param {string} [props.text] - default button text (e.g. "Log in" or "Sign up")
 * @param {string} [props.loadingText] - text to show when loading
 * @returns {JSX.Element}
 */

function AuthSubmitButton({ loading, text, loadingText }) {
    return (
        <button
            className="btn btn-dark btn-lg rounded-3"
            disabled={loading}
            type="submit"
        >
            {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {loadingText}
                </>
            ) : (
                text
            )}
        </button>
    );
}

export default AuthSubmitButton;
