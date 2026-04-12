import { Link } from 'react-router-dom';
import '../stylesheets/Navbar/NavbarBrand.css';

/**
 * Renders the StudySync brand title as a link to the home page.
 *
 * @returns {React.JSX.Element} The brand title link
 */
function NavbarBrand() {
    return (
        <Link to="/" className="navbar-title">
            <span className="title">StudySync</span>
        </Link>
    );
}

export default NavbarBrand;