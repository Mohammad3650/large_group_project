/**
 * Displays global error messages.
 * 
 * @param {string[]} props.messages - Array of error messages to display
 * @returns {JSX.Element} - Alert box with error messages or null if no messages exist
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