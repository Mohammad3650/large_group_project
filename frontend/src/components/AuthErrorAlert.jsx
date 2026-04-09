/**
 * Displays global error messages.
 */

function AuthErrorAlert({ messages }) {
    if (!messages || messages.length === 0) return null;

    return (
        <div className="alert alert-danger text-center" role="alert">
            {messages.map((message) => (
                <div key={message}>{message}</div>
            ))}
        </div>
    );
}

export default AuthErrorAlert;