import './stylesheets/Navbar.css';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton.jsx';
import useUsername from '../utils/Hooks/useUsername.js';
import useAuthStatus from '../utils/Auth/authStatus';
import useDropdown from '../utils/Hooks/useDropdown.js';
import ToggleDarkMode from './ToggleDarkMode.jsx';
import { LuClipboardList, LuCalendar } from 'react-icons/lu';
import { FaUser, FaUserCircle, FaCog } from 'react-icons/fa';

/**
 * Navbar component - site-wide navigation header.
 * Displays the app title, navigation links, theme toggle, and user account controls.
 * Shows dashboard and calendar links when the user is logged in,
 * and a user dropdown (with username, settings link, and logout) on authentication.
 *
 * @param {Object} props
 * @param {string} props.theme - Current theme mode
 * @param {Function} props.toggleTheme - Function to switch theme
 * @returns {JSX.Element} The navigation header
 */
function Navbar({ theme, toggleTheme }) {
    const isLoggedIn = useAuthStatus();
    const { username } = useUsername(isLoggedIn);
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();

    return (
        <header>
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="navbar-title">
                        <span className="title">StudySync</span>
                    </Link>

                    {isLoggedIn && (
                        <>
                            <Link to="/dashboard" className="navbar-link">
                                <LuClipboardList className="navbar-icon" />
                                <span>Dashboard</span>
                            </Link>

                            <Link to="/calendar" className="navbar-link">
                                <LuCalendar className="navbar-icon" />
                                <span>Calendar</span>
                            </Link>
                        </>
                    )}
                </div>

                <div className="navbar-right">
                    <ToggleDarkMode theme={theme} toggleTheme={toggleTheme} />

                    {isLoggedIn ? (
                        <div className="navbar-user" ref={dropdownRef}>
                            <FaUserCircle
                                className="navbar-icon user-icon"
                                onClick={() => setDropdownOpen((prev) => !prev)}
                            />

                            {dropdownOpen && (
                                <div className="navbar-dropdown">
                                    <span className="dropdown-username">
                                        <FaUser /> {username}
                                    </span>
                                    <hr className="navbar-dropdown-divider" />
                                    <Link
                                        to="/settings"
                                        className="dropdown-link"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <FaCog /> Settings
                                    </Link>
                                    <hr className="navbar-dropdown-divider" />
                                    <LogoutButton />
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="navbar-tagline">Built for Students</span>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
