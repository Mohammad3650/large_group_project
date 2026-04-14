import formatSubscriptionLastSyncedAt from './utils/Helpers/formatSubscriptionLastSyncedAt.js';
import './stylesheets/SubscriptionList.css';

/**
 * Reusable action button for subscription actions.
 *
 * @param {Object} props
 * @param {string} props.className
 * @param {Function} props.onClick
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function SubscriptionActionButton({ className, onClick, children }) {
    return (
        <button type="button" className={className} onClick={onClick}>
            {children}
        </button>
    );
}

function confirmSubscriptionDeletion() {
    return window.confirm(
        'Are you sure you want to delete this calendar subscription?'
    );
}

function SubscriptionCard({ subscription, onRefresh, onDelete }) {
    function handleDeleteClick() {
        if (!confirmSubscriptionDeletion()) {
            return;
        }

        onDelete(subscription.id);
    }

    return (
        <div className="subscription-card">
            <div className="subscription-card-content">
                <h3>{subscription.name}</h3>

                <p className="subscription-url">{subscription.source_url}</p>

                <p className="subscription-meta">
                    Last synced:{' '}
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
                    onClick={handleDeleteClick}
                >
                    Delete
                </SubscriptionActionButton>
            </div>
        </div>
    );
}

/**
 * Render the saved calendar subscription list.
 *
 * @param {Object} props
 * @param {Array} props.subscriptions
 * @param {Function} props.onRefresh
 * @param {Function} props.onDelete
 * @returns {JSX.Element}
 */
function SubscriptionList({ subscriptions, onRefresh, onDelete }) {
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
                <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onRefresh={onRefresh}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default SubscriptionList;