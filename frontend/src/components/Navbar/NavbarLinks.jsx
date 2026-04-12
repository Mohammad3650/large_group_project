import { Link } from 'react-router-dom';
import { LuClipboardList, LuCalendar } from 'react-icons/lu';
import '../stylesheets/Navbar/NavbarLinks.css';

/**
 * Renders the main navigation links for authenticated users.
 *
 * @returns {React.JSX.Element} The dashboard and calendar navigation links
 */
function NavbarLinks() {
    return (
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
    );
}

export default NavbarLinks;