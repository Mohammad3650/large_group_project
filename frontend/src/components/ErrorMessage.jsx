/**
 * Displays an error message.
 *
 * @param {Object} props
 * @param {string} props.error - The error message to display.
 * @returns {React.JSX.Element} - The error message
 */
function ErrorMessage({ error }) {
    return <p>{error}</p>;
}

export default ErrorMessage;