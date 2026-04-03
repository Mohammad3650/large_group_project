import SubscriptionForm from './SubscriptionForm.jsx';
import SubscriptionList from './SubscriptionList.jsx';
import './stylesheets/SubscriptionSection.css';

/**
 * Section for managing timetable subscriptions.
 * Displays any errors, the import form, and the list of existing subscriptions.
 *
 * @param {Object} props
 * @param {Array} props.subscriptions - List of current subscriptions
 * @param {string} props.error - Error message to display, if any
 * @param {Function} props.onImport - Callback to import a new subscription
 * @param {Function} props.onRefresh - Callback to refresh a subscription by ID
 * @param {Function} props.onDelete - Callback to delete a subscription by ID
 * @returns {JSX.Element} The subscription section
 */
function SubscriptionSection({ subscriptions, error, onImport, onRefresh, onDelete }) {
    return (
        <div className="subscription-section">
            {error && <p className="subscription-error">{error}</p>}
            <SubscriptionForm onImport={onImport} />
            <SubscriptionList
                subscriptions={subscriptions}
                onRefresh={onRefresh}
                onDelete={onDelete}
            />
        </div>
    );
}

export default SubscriptionSection;
