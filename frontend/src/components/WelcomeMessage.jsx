import './stylesheets/WelcomeMessage.css';

/**
 * Displays a personalised welcome heading for a given page.
 *
 * @param {Object} props
 * @param {string} props.page - The name of the page (e.g. "Dashboard", "calendar").
 * @param {string} props.username - The current user's username.
 * @returns {React.JSX.Element}
 */
function WelcomeMessage({ page, username }) {
    return <h1 className="welcome-message">Welcome to your {page}, {username}!</h1>;
}

export default WelcomeMessage;
