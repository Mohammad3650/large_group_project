import ProfileSection from './ProfileSection.jsx';
import SubscriptionSection from './SubscriptionSection.jsx';
import ExportSection from './ExportSection.jsx';

/**
 * Renders the appropriate settings section based on the active section key.
 *
 * @param {Object} props
 * @param {string} props.activeSection - The currently active section key
 * @param {Array} props.subscriptions - List of calendar subscriptions
 * @param {string} props.error - Current error message
 * @param {Function} props.setError - Setter for the error message state
 * @param {Function} props.onImport - Callback to import a subscription
 * @param {Function} props.onRefresh - Callback to refresh a subscription
 * @param {Function} props.onDelete - Callback to delete a subscription
 * @returns {React.JSX.Element} The active settings section
 */
function SettingsContent({ activeSection, subscriptions, error, setError, onImport, onRefresh, onDelete }) {
    if (activeSection === 'profile') return <ProfileSection />;

    if (activeSection === 'subscriptions') return (
        <SubscriptionSection
            subscriptions={subscriptions}
            error={error}
            onImport={onImport}
            onRefresh={onRefresh}
            onDelete={onDelete}
        />
    );

    if (activeSection === 'export') return <ExportSection setError={setError} />;

    return null;
}

export default SettingsContent;