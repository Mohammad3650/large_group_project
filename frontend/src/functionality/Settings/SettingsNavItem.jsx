import './stylesheets/SettingsNavItem.css'

/**
 * A single navigation item in the settings sidebar.
 *
 * @param {Object} props
 * @param {string} props.label - Display label for the item
 * @param {React.ComponentType} props.icon - Icon component to render
 * @param {boolean} props.isActive - Whether this item is currently active
 * @param {Function} props.onClick - Callback invoked when the item is clicked
 * @returns {React.JSX.Element} A single settings navigation button
 */
function SettingsNavItem({ label, icon: Icon, isActive, onClick }) {
    return (
        <button
            className={`settings-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <Icon className="settings-nav-icon" />
            {label}
        </button>
    );
}

export default SettingsNavItem;