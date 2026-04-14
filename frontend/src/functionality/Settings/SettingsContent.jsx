import ProfileSection from './ProfileSection.jsx';
import SubscriptionSection from './SubscriptionSection.jsx';
import ExportSection from './ExportSection.jsx';

function renderSubscriptionSection(props) {
    return (
        <SubscriptionSection
            subscriptions={props.subscriptions}
            error={props.error}
            onImport={props.onImport}
            onRefresh={props.onRefresh}
            onDelete={props.onDelete}
        />
    );
}

/**
 * Renders the appropriate settings section based on the active section key.
 *
 * @param {Object} props
 * @returns {React.JSX.Element|null}
 */

function SettingsContent(props) {
    if (props.activeSection === 'profile') {
        return <ProfileSection />;
    }

    if (props.activeSection === 'subscriptions') {
        return renderSubscriptionSection(props);
    }

    if (props.activeSection === 'export') {
        return <ExportSection setError={props.setError} />;
    }

    return null;
}

export default SettingsContent;