import { FaUserCircle } from 'react-icons/fa';
import NavbarDropdownMenu from './NavbarDropdownMenu.jsx';
import useDropdown from '../../utils/Hooks/useDropdown.js';
import '../stylesheets/Navbar/NavbarUserDropdown.css';

/**
 * Renders the user icon and toggles the navbar dropdown menu on click.
 *
 * @param {Object} props
 * @param {string} props.username - The username of the currently authenticated user
 * @returns {React.JSX.Element} The user icon and dropdown menu
 */
function NavbarUserDropdown({ username }) {
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();

    return (
        <div className="navbar-user" ref={dropdownRef}>
            <FaUserCircle
                className="navbar-icon user-icon"
                aria-label="User Icon"
                onClick={() => setDropdownOpen((prev) => !prev)}
            />
            {dropdownOpen && (
                <NavbarDropdownMenu
                    username={username}
                    onClose={() => setDropdownOpen(false)}
                />
            )}
        </div>
    );
}

export default NavbarUserDropdown;