import { Link } from 'react-router-dom';
import { FaUser, FaCog } from 'react-icons/fa';
import LogoutButton from '../LogoutButton.jsx';
import '../stylesheets/Navbar/NavbarDropdownMenu.css';

/**
 * Renders the dropdown menu content for the navbar user section.
 * Displays the username, a settings link, and a logout button.
 *
 * @param {Object} props
 * @param {string} props.username - The username of the currently authenticated user
 * @param {Function} props.onClose - Callback to close the dropdown menu
 * @returns {React.JSX.Element} The dropdown menu
 */
function NavbarDropdownMenu({ username, onClose }) {
    return (
        <div className="navbar-dropdown">
            <span className="navbar-dropdown-user">
                <FaUser /> {username}
            </span>
            <hr className="navbar-dropdown-divider" />
            <Link to="/settings" className="dropdown-link" onClick={onClose}>
                <FaCog /> Settings
            </Link>
            <hr className="navbar-dropdown-divider" />
            <LogoutButton />
        </div>
    );
}

export default NavbarDropdownMenu;