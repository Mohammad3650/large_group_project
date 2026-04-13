import handleImportSubscription from '../Helpers/handleImportSubscription.js';
import handleRefreshSubscription from '../Helpers/handleRefreshSubscription.js';
import handleDeleteSubscription from '../Helpers/handleDeleteSubscription.js';

/**
 * Returns handlers for importing, refreshing, and deleting calendar subscriptions.
 *
 * @param {Object} context - Shared context passed to each handler
 * @param {Function} context.setSubscriptions - Setter for the subscriptions list
 * @param {Function} context.setError - Setter for the error message state
 * @param {Function} context.refetchBlocks - Callback to re-fetch time blocks
 * @returns {{ onImport: Function, onRefresh: Function, onDelete: Function }}
 */
function useSubscriptionActions({ setSubscriptions, setError, refetchBlocks }) {
    const onImport = (payload) => handleImportSubscription(payload, { setSubscriptions, setError, refetchBlocks });
    const onRefresh = (id) => handleRefreshSubscription(id, { setSubscriptions, setError, refetchBlocks });
    const onDelete = (id) => handleDeleteSubscription(id, { setSubscriptions, setError, refetchBlocks });

    return { onImport, onRefresh, onDelete };
}

export default useSubscriptionActions;
