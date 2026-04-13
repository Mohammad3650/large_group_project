/**
 * Displays a centered loading spinner and status message.
 *
 * @param {Object} props
 * @param {string} props.message - Message shown below the spinner.
 * @returns {JSX.Element}
 */
function RouteLoadingScreen({ message }) {
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="text-center">
                <div className="spinner-border text-dark mb-3" role="status" />
                <p className="text-muted mb-0">{message}</p>
            </div>
        </div>
    );
}

export default RouteLoadingScreen;