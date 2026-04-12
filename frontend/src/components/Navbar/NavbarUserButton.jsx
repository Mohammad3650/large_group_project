import { FaUserCircle } from 'react-icons/fa';
import NavbarUserDropdown from './NavbarUserDropdown.jsx';
import useDropdown from '../../utils/Hooks/useDropdown.js';
import useCloseOnAuthChange from '../utils/Hooks/useCloseOnAuthChange.js';
import '../stylesheets/Navbar/NavbarUserButton.css';

/**
 * Renders the user icon and toggles the navbar dropdown menu on click.
 * Closes the dropdown automatically when the user's authentication status changes.
 *
 * @param {Object} props
 * @param {string} props.username - The username of the currently authenticated user
 * @param {boolean} props.isLoggedIn - Whether the user is currently authenticated
 * @returns {React.JSX.Element} The user icon and dropdown menu
 */
function NavbarUserButton({ username, isLoggedIn }) {
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();

    useCloseOnAuthChange(isLoggedIn, setDropdownOpen);

    return (
        <div className="navbar-user" ref={dropdownRef}>
            <FaUserCircle
                className={`navbar-icon user-icon ${dropdownOpen ? 'active' : ''}`}
                aria-label="User Icon"
                onClick={() => setDropdownOpen((prev) => !prev)}
            />
            {dropdownOpen && (
                <NavbarUserDropdown
                    username={username}
                    onClose={() => setDropdownOpen(false)}
                />
            )}
        </div>
    );
}

export default NavbarUserButton;