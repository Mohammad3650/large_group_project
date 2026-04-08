import { useState } from 'react';
import SettingsSidebar from './SettingsSidebar.jsx';
import ProfileSection from './ProfileSection.jsx';
import SubscriptionSection from './SubscriptionSection.jsx';
import ExportSection from './ExportSection.jsx';
import useSubscriptions from '../../utils/Hooks/useSubscriptions.js';
import useSubscriptionActions from '../../utils/Hooks/useSubscriptionActions.js';
import useAutoResetError from '../../utils/Hooks/useAutoResetError.js';
import './stylesheets/Settings.css';

/**
 * Settings page with sidebar navigation for managing profile details,
 * calendar subscriptions, and data export options.
 *
 * @returns {JSX.Element} The settings page
 */
function Settings() {
    const [activeSection, setActiveSection] = useState('profile');
    const [error, setError] = useState('');
    const { subscriptions, setSubscriptions } = useSubscriptions(setError);
    const { onImport, onRefresh, onDelete } = useSubscriptionActions({ setSubscriptions, setError, refetchBlocks: () => {} });

    useAutoResetError(error, setError);

    return (
        <div className="settings-layout">
            <SettingsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <div className="settings-main">
                {activeSection === 'profile' && <ProfileSection />}

                {activeSection === 'subscriptions' && (
                    <SubscriptionSection
                        subscriptions={subscriptions}
                        error={error}
                        onImport={onImport}
                        onRefresh={onRefresh}
                        onDelete={onDelete}
                    />
                )}

                {activeSection === 'export' && <ExportSection setError={setError} />}
            </div>
        </div>
    );
}

export default Settings;
