import SubscriptionForm from './SubscriptionForm.jsx';
import SubscriptionList from './SubscriptionList.jsx';
import './stylesheets/SubscriptionSection.css';

/**
 * Section for managing timetable subscriptions.
 *
 * @param {Object} props
 * @param {Array} props.subscriptions
 * @param {string} props.error
 * @param {Function} props.onImport
 * @param {Function} props.onRefresh
 * @param {Function} props.onDelete
 * @returns {JSX.Element}
 */
function SubscriptionSection({
    subscriptions,
    error,
    onImport,
    onRefresh,
    onDelete
}) {
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