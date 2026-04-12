import { useState } from 'react';
import SettingsSidebar from './SettingsSidebar.jsx';
import SettingsContent from './SettingsContent.jsx';
import useSubscriptions from '../../utils/Hooks/useSubscriptions.js';
import useSubscriptionActions from '../../utils/Hooks/useSubscriptionActions.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import useAutoResetError from '../../utils/Hooks/useAutoResetError.js';
import './stylesheets/Settings.css';

/**
 * Settings page with sidebar navigation for managing profile details,
 * calendar subscriptions, and data export options.
 * Automatically resets error messages after a short delay.
 *
 * @returns {React.JSX.Element} The settings page
 */
function Settings() {
    const [activeSection, setActiveSection] = useState('profile');
    const [error, setError] = useState('');
    const { subscriptions, setSubscriptions } = useSubscriptions(setError);
    const { onImport, onRefresh, onDelete } = useSubscriptionActions({ setSubscriptions, setError, refetchBlocks: () => {} });

    useBodyClass('settings-page');
    useAutoResetError(error, setError);

    return (
        <div className="settings-layout">
            <SettingsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="settings-main">
                <SettingsContent
                    activeSection={activeSection}
                    subscriptions={subscriptions}
                    error={error}
                    setError={setError}
                    onImport={onImport}
                    onRefresh={onRefresh}
                    onDelete={onDelete}
                />
            </div>
        </div>
    );
}

export default Settings;