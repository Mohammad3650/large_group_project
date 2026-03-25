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
    if (!subscriptions.length) {
        return (
            <div className="subscription-list">
                <p className="subscription-empty">No calendar subscriptions added yet.</p>
            </div>
        );
    }

    return (
        <div className="subscription-list">
            {subscriptions.map((subscription) => (
                <div key={subscription.id} className="subscription-card">
                    <div className="subscription-card-content">
                        <h3>{subscription.name}</h3>
                        <p className="subscription-url">{subscription.source_url}</p>
                        <p className="subscription-meta">
                            Last synced:{" "}
                            {subscription.last_synced_at
                                ? new Date(subscription.last_synced_at).toLocaleString()
                                : "Never"}
                        </p>
                        {subscription.last_error && (
                            <p className="subscription-error-text">
                                {subscription.last_error}
                            </p>
                        )}
                    </div>

                    <div className="subscription-actions">
                        <button
                            type="button"
                            className="subscription-action-button"
                            onClick={() => onRefresh(subscription.id)}
                        >
                            Refresh
                        </button>

                        <button
                            type="button"
                            className="subscription-delete-button"
                            onClick={() => onDelete(subscription.id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SubscriptionList;