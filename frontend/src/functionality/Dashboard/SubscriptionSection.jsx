import { useState } from 'react';
import SubscriptionForm from './SubscriptionForm.jsx';
import SubscriptionList from './SubscriptionList.jsx';
import './stylesheets/SubscriptionSection.css';

/**
 * Collapsible section for managing timetable subscriptions.
 * Displays a toggle header and, when expanded, any errors, the import form,
 * and the list of existing subscriptions.
 *
 * @param {object} props
 * @param {Array} props.subscriptions - List of current subscriptions
 * @param {string} props.error - Error message to display, if any
 * @param {Function} props.onImport - Callback to import a new subscription
 * @param {Function} props.onRefresh - Callback to refresh a subscription by ID
 * @param {Function} props.onDelete - Callback to delete a subscription by ID
 * @returns {JSX.Element} The subscription section
 */
function SubscriptionSection({ subscriptions, error, onImport, onRefresh, onDelete }) {
    const [showSubscriptions, setShowSubscriptions] = useState(true);

    return (
        <>
            <div
                className="day-section"
                onClick={() => setShowSubscriptions((prev) => !prev)}
            >
                <span className={`arrow ${showSubscriptions ? 'open' : 'closed'}`}>
                    ^
                </span>
                <h5>Timetable Subscriptions</h5>
            </div>

            {showSubscriptions && (
                <div className="subscription-section">
                    {error && (
                        <p className="subscription-error">{error}</p>
                    )}
                    <SubscriptionForm onImport={onImport} />
                    <SubscriptionList
                        subscriptions={subscriptions}
                        onRefresh={onRefresh}
                        onDelete={onDelete}
                    />
                </div>
            )}
        </>
    );
}

export default SubscriptionSection;
