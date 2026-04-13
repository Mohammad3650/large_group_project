/**
 * Displays a success message
 */

function AuthSuccessAlert({ message }) {
    if (!message) return null;

    return (
        <div className="alert alert-success text-center" role="alert">
            {message}
        </div>
    );
}

export default AuthSuccessAlert;