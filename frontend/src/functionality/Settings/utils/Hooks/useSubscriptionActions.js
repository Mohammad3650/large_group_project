import handleImportSubscription from '../Helpers/handleImportSubscription.js';
import handleRefreshSubscription from '../Helpers/handleRefreshSubscription.js';
import handleDeleteSubscription from '../Helpers/handleDeleteSubscription.js';

function buildSubscriptionActionContext({
    setSubscriptions,
    setError,
    refetchBlocks
}) {
    return {
        setSubscriptions,
        setError,
        refetchBlocks
    };
}

/**
 * Returns handlers for importing, refreshing, and deleting calendar subscriptions.
 *
 * @param {Object} context
 * @returns {{ onImport: Function, onRefresh: Function, onDelete: Function }}
 */
function useSubscriptionActions(context) {
    const actionContext = buildSubscriptionActionContext(context);

    const onImport = (payload) =>
        handleImportSubscription(payload, actionContext);

    const onRefresh = (subscriptionId) =>
        handleRefreshSubscription(subscriptionId, actionContext);

    const onDelete = (subscriptionId) =>
        handleDeleteSubscription(subscriptionId, actionContext);

    return { onImport, onRefresh, onDelete };
}

export default useSubscriptionActions;