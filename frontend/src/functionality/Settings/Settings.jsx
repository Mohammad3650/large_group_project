import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaKey, FaFileCsv, FaFileDownload } from 'react-icons/fa';
import SubscriptionForm from '../Dashboard/SubscriptionForm.jsx';
import SubscriptionList from '../Dashboard/SubscriptionList.jsx';
import useSubscriptions from '../../utils/Hooks/useSubscriptions.js';
import useAutoResetError from '../../utils/Hooks/useAutoResetError.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import handleImportSubscription from '../../utils/Helpers/handleImportSubscription.js';
import handleRefreshSubscription from '../../utils/Helpers/handleRefreshSubscription.js';
import handleDeleteSubscription from '../../utils/Helpers/handleDeleteSubscription.js';
import handleExportCsv from '../../utils/Api/handleExportCsv.js';
import handleExportIcs from '../../utils/Api/handleExportIcs.js';
import './stylesheets/Settings.css';

/**
 * Settings page - allows users to manage their profile, timetable subscriptions,
 * and export their data.
 *
 * @returns {JSX.Element} The settings page
 */
function Settings() {
    const [error, setError] = useState('');
    const { subscriptions, setSubscriptions } = useSubscriptions(setError);

    useBodyClass('settings-page');
    useAutoResetError(error, setError);

    const context = { setSubscriptions, setError, refetchBlocks: () => {} };

    const onImport = (payload) => handleImportSubscription(payload, context);
    const onRefresh = (id) => handleRefreshSubscription(id, context);
    const onDelete = (id) => handleDeleteSubscription(id, context);

    return (
        <div className="settings-content">
            <h1>Settings</h1>

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

            <div className="settings-section">
                <h2>Export</h2>
                <div className="settings-export-buttons">
                    <button
                        type="button"
                        className="export-csv-button"
                        onClick={() => handleExportCsv(setError)}
                    >
                        <FaFileCsv className="settings-link-icon" />
                        Export CSV
                    </button>
                    <button
                        type="button"
                        className="export-csv-button"
                        onClick={() => handleExportIcs(setError)}
                    >
                        <FaFileDownload className="settings-link-icon" />
                        Export ICS
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
