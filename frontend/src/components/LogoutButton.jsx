import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/authStorage';
import './stylesheets/Navbar.css';

/**
 * Button component that logs the user out and redirects to login page
 *
 * Clears auth tokens and navigates the user to "/login"
 *
 * @returns {JSX.Element} A logout button element
 */
function LogoutButton() {
    const nav = useNavigate();

    function handleLogout() {
        logout();
        nav('/login');
    }

    return (
        <button className={'logout-button'} onClick={handleLogout}>
            Logout
        </button>
    );
}

export default LogoutButton;
