import NavbarBrand from './NavbarBrand.jsx';
import NavbarLinks from './NavbarLinks.jsx';
import NavbarUserDropdown from './NavbarUserDropdown.jsx';
import ToggleDarkMode from '../ToggleDarkMode.jsx';
import useAuthStatus from '../../utils/Auth/authStatus.js';
import useUsername from '../../utils/Hooks/useUsername.js';
import '../stylesheets/Navbar/Navbar.css';

/**
 * Site-wide navigation header.
 * Displays the brand, navigation links, theme toggle, and user account controls.
 * Shows navigation links and the user dropdown when the user is logged in,
 * and a tagline when they are not.
 *
 * @param {Object} props
 * @param {string} props.theme - The current theme mode
 * @param {Function} props.toggleTheme - Callback to switch the theme
 * @returns {React.JSX.Element} The navigation header
 */
function Navbar({ theme, toggleTheme }) {
    const isLoggedIn = useAuthStatus();
    const { username } = useUsername(isLoggedIn);

    return (
        <header>
            <div className="navbar-container">
                <div className="navbar-left">
                    <NavbarBrand />
                    {isLoggedIn && <NavbarLinks />}
                </div>

                <div className="navbar-right">
                    <ToggleDarkMode theme={theme} toggleTheme={toggleTheme} />
                    {isLoggedIn
                        ? <NavbarUserDropdown username={username} isLoggedIn={isLoggedIn} />
                        : <span className="navbar-tagline">Built for Students</span>
                    }
                </div>
            </div>
        </header>
    );
}

export default Navbar;