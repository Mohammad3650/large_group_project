import { useState } from 'react';
import SettingsSidebar from './SettingsSidebar.jsx';
import SettingsContent from './SettingsContent.jsx';
import useSubscriptions from './utils/Hooks/useSubscriptions.js';
import useSubscriptionActions from './utils/Hooks/useSubscriptionActions.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import useAutoResetError from '../../utils/Hooks/useAutoResetError.js';
import './stylesheets/Settings.css';

function noop() {}

/**
 * Settings page with sidebar navigation for managing profile details,
 * calendar subscriptions, and data export options.
 *
 * @returns {React.JSX.Element} The settings page
 */
function Settings() {
    const [activeSection, setActiveSection] = useState('profile');
    const [error, setError] = useState('');

    const { subscriptions, setSubscriptions } = useSubscriptions(setError);

    const subscriptionActions = useSubscriptionActions({
        setSubscriptions,
        setError,
        refetchBlocks: noop
    });

    useBodyClass('settings-page');
    useAutoResetError(error, setError);

    return (
        <div className="settings-layout">
            <SettingsSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />

            <div className="settings-main">
                <SettingsContent
                    activeSection={activeSection}
                    subscriptions={subscriptions}
                    error={error}
                    setError={setError}
                    onImport={subscriptionActions.onImport}
                    onRefresh={subscriptionActions.onRefresh}
                    onDelete={subscriptionActions.onDelete}
                />
            </div>
        </div>
    );
}

export default Settings;