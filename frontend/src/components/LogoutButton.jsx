import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../utils/Auth/authStorage';
import './stylesheets/LogoutButton.css';

/**
 * Button component that logs the user out and redirects to login page.
 * Clears auth tokens and navigates the user to "/login".
 *
 * @returns {React.JSX.Element} A logout button element
 */
function LogoutButton() {
    const nav = useNavigate();

    function handleLogout() {
        logout();
        nav('/login');
    }

    return (
        <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
        </button>
    );
}

export default LogoutButton;
