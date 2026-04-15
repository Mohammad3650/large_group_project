import { api } from '../../../../api.js';
import { CALENDAR_SUBSCRIPTIONS_ENDPOINT } from '../../../../constants/apiEndpoints.js';

/**
 * Refresh a saved calendar subscription.
 *
 * @param {number} subscriptionId
 * @returns {Promise<Object>}
 */
async function refreshCalendarSubscription(subscriptionId) {
    const response = await api.post(
        `${CALENDAR_SUBSCRIPTIONS_ENDPOINT}${subscriptionId}/refresh/`
    );

    return response.data;
}

export default refreshCalendarSubscription;