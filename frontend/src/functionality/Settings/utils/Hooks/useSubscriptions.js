import { useEffect, useState } from 'react';
import getCalendarSubscriptions from '../Api/getCalendarSubscriptions.js';

const loadSubscriptionsErrorMessage = 'Failed to load calendar subscriptions';

/**
 * Fetch and manage settings calendar subscriptions.
 *
 * @param {Function} setError
 * @returns {{ subscriptions: Array, setSubscriptions: Function }}
 */
function useSubscriptions(setError) {
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        async function fetchSubscriptions() {
            try {
                const data = await getCalendarSubscriptions();
                setSubscriptions(data);
            } catch {
                setError(loadSubscriptionsErrorMessage);
            }
        }

        fetchSubscriptions();
    }, [setError]);

    return { subscriptions, setSubscriptions };
}

export default useSubscriptions;