import { useEffect, useState } from 'react';
import getCalendarSubscriptions from '../../functionality/Dashboard/utils/api/getCalendarSubscriptions.js';

function useSubscriptions(setError) {
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        async function fetchSubscriptions() {
            try {
                const data = await getCalendarSubscriptions();
                setSubscriptions(data);
            } catch {
                setError('Failed to load calendar subscriptions');
            }
        }

        fetchSubscriptions();
    }, []);

    return { subscriptions, setSubscriptions };
}

export default useSubscriptions;