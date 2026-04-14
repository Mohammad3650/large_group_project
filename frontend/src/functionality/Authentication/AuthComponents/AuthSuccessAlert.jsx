/**
 * Displays a success message
 *
 * @param {string} props.message - Message to display in the alert
 * @returns {JSX.Element} - Alert box with success message or null if no message exists
 */

function AuthSuccessAlert({ message }) {
    if (!message) return null;

    return (
        <div
            className="alert alert-success text-center"
            role="alert"
        >
            {message}
        </div>
    );
}

export default AuthSuccessAlert;
