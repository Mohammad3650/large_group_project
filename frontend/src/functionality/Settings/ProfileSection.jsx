import { Link } from 'react-router-dom';
import { FaUser, FaKey } from 'react-icons/fa';
import './stylesheets/ProfileSection.css';

/**
 * Settings section for managing the user's profile.
 * Provides links to the edit profile and change password pages.
 *
 * @returns {React.JSX.Element} The profile settings section
 */
function ProfileSection() {
    return (
        <div className="settings-section">
            <h2>Profile</h2>
            <div className="settings-profile-links">
                <Link to="/profile" className="settings-profile-link">
                    <FaUser className="settings-link-icon" />
                    Edit Profile
                </Link>
                <Link to="/change-password" className="settings-profile-link">
                    <FaKey className="settings-link-icon" />
                    Change Password
                </Link>
            </div>
        </div>
    );
}

export default ProfileSection;
