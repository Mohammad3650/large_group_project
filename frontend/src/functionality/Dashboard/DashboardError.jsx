/**
 * Displays a dashboard-level error message.
 *
 * @param {Object} props
 * @param {string} props.error - The error message to display.
 * @returns {React.JSX.Element}
 */
function DashboardError({ error }) {
    return <p>{error}</p>;
}

export default DashboardError;