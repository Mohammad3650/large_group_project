import { FaUser, FaCalendarAlt, FaFileExport } from 'react-icons/fa';
import SettingsNavItem from './SettingsNavItem.jsx';
import LogoutButton from '../../components/LogoutButton.jsx';
import './stylesheets/SettingsSidebar.css';

const NAV_ITEMS = [
    { key: 'profile',       label: 'Profile',      icon: FaUser },
    { key: 'subscriptions', label: 'Subscriptions', icon: FaCalendarAlt },
    { key: 'export',        label: 'Export',        icon: FaFileExport },
];

/**
 * Sidebar navigation for the settings page.
 *
 * @param {Object} props
 * @param {string} props.activeSection - Currently active section key
 * @param {Function} props.setActiveSection - Setter for the active section
 * @returns {React.JSX.Element} The settings sidebar
 */
function SettingsSidebar({ activeSection, setActiveSection }) {
    return (
        <nav className="settings-sidebar">
            {NAV_ITEMS.map(({ key, label, icon }) => (
                <SettingsNavItem
                    key={key}
                    navKey={key}
                    label={label}
                    icon={icon}
                    isActive={activeSection === key}
                    onClick={() => setActiveSection(key)}
                />
            ))}
            <hr className="settings-nav-divider" />
            <LogoutButton />
        </nav>
    );
}

export default SettingsSidebar;