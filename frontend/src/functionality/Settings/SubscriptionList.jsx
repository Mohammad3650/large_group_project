import './stylesheets/SubscriptionList.css';
import formatSubscriptionLastSyncedAt from './utils/Helpers/formatSubscriptionLastSyncedAt.js';
/**
 * Reusable action button for subscription actions.
 *
 * @param {Object} props - Component props
 * @param {string} props.className - Button CSS class
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button text/content
 * @returns {JSX.Element} Subscription action button
 */
function SubscriptionActionButton({ className, onClick, children }) {
    return (
        <button type="button" className={className} onClick={onClick}>
            {children}
        </button>
    );
}

/**
 * Render the saved calendar subscription list.
 *
 * @param {Object} props - Component props
 * @param {Array} props.subscriptions - Saved subscriptions
 * @param {Function} props.onRefresh - Refresh handler
 * @param {Function} props.onDelete - Delete handler
 * @returns {JSX.Element} The subscription list
 */
function SubscriptionList({ subscriptions, onRefresh, onDelete }) {
    /**
     * Confirm before deleting a saved calendar subscription.
     *
     * @param {number} subscriptionId - Subscription identifier
     */
    function handleDeleteClick(subscriptionId) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this calendar subscription?'
        );

        if (!confirmed) return;

        onDelete(subscriptionId);
    }

    if (!subscriptions.length) {
        return (
            <div className="subscription-list">
                <p className="subscription-empty">
                    No calendar subscriptions added yet.
                </p>
            </div>
        );
    }

    return (
        <div className="subscription-list">
            {subscriptions.map((subscription) => (
                <div key={subscription.id} className="subscription-card">
                    <div className="subscription-card-content">
                        <h3>{subscription.name}</h3>
                        <p className="subscription-url">
                            {subscription.source_url}
                        </p>
                        <p className="subscription-meta">
                            Last synced:
                            {formatSubscriptionLastSyncedAt(subscription.last_synced_at)}
                        </p>
                        {subscription.last_error && (
                            <p className="subscription-error-text">
                                {subscription.last_error}
                            </p>
                        )}
                    </div>

                    <div className="subscription-actions">
                        <SubscriptionActionButton
                            className="subscription-action-button"
                            onClick={() => onRefresh(subscription.id)}
                        >
                            Refresh
                        </SubscriptionActionButton>

                        <SubscriptionActionButton
                            className="subscription-delete-button"
                            onClick={() => handleDeleteClick(subscription.id)}
                        >
                            Delete
                        </SubscriptionActionButton>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SubscriptionList;