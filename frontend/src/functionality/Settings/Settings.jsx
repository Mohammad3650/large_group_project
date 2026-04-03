import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaKey, FaCalendarAlt, FaFileExport } from 'react-icons/fa';
import SubscriptionForm from '../Dashboard/SubscriptionForm.jsx';
import SubscriptionList from '../Dashboard/SubscriptionList.jsx';
import ExportCsvButton from '../../components/ExportCsvButton.jsx';
import ExportIcsButton from '../../components/ExportIcsButton.jsx';
import LogoutButton from '../../components/LogoutButton.jsx';
import useSubscriptions from '../../utils/Hooks/useSubscriptions.js';
import useAutoResetError from '../../utils/Hooks/useAutoResetError.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import handleImportSubscription from '../../utils/Helpers/handleImportSubscription.js';
import handleRefreshSubscription from '../../utils/Helpers/handleRefreshSubscription.js';
import handleDeleteSubscription from '../../utils/Helpers/handleDeleteSubscription.js';
import './stylesheets/Settings.css';

const NAV_ITEMS = [
    { key: 'profile',       label: 'Profile',      icon: FaUser },
    { key: 'subscriptions', label: 'Subscriptions', icon: FaCalendarAlt },
    { key: 'export',        label: 'Export',        icon: FaFileExport },
];

/**
 * Settings page — sidebar navigation with profile, subscriptions, export,
 * and logout sections.
 *
 * @returns {JSX.Element} The settings page
 */
function Settings() {
    const [activeSection, setActiveSection] = useState('profile');
    const [error, setError] = useState('');
    const { subscriptions, setSubscriptions } = useSubscriptions(setError);

    useBodyClass('settings-page');
    useAutoResetError(error, setError);

    const context = { setSubscriptions, setError, refetchBlocks: () => {} };

    const onImport = (payload) => handleImportSubscription(payload, context);
    const onRefresh = (id) => handleRefreshSubscription(id, context);
    const onDelete = (id) => handleDeleteSubscription(id, context);

    return (
        <div className="settings-layout">
            <nav className="settings-sidebar">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        className={`settings-nav-item ${activeSection === key ? 'active' : ''}`}
                        onClick={() => setActiveSection(key)}
                    >
                        <Icon className="settings-nav-icon" />
                        {label}
                    </button>
                ))}

                <hr className="settings-nav-divider" />

                <LogoutButton />
            </nav>

            <div className="settings-main">
                {activeSection === 'profile' && (
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
                )}

                {activeSection === 'subscriptions' && (
                    <div className="settings-section">
                        <h2>Timetable Subscriptions</h2>
                        {error && <p className="subscription-error">{error}</p>}
                        <SubscriptionForm onImport={onImport} />
                        <SubscriptionList
                            subscriptions={subscriptions}
                            onRefresh={onRefresh}
                            onDelete={onDelete}
                        />
                    </div>
                )}

                {activeSection === 'export' && (
                    <div className="settings-section">
                        <h2>Export</h2>
                        <div className="settings-export-buttons">
                            <ExportCsvButton setError={setError} />
                            <ExportIcsButton setError={setError} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Settings;
