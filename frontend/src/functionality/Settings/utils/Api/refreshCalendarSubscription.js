import { api } from '../../../../api.js';

const CALENDAR_SUBSCRIPTIONS_ENDPOINT = '/api/calendar-subscriptions/';

/**
 * Refresh a saved calendar subscription.
 *
 * @param {number} subscriptionId - The subscription ID
 * @returns {Promise<Object>} The API response data
 */
async function refreshCalendarSubscription(subscriptionId) {
    const response = await api.post(
        `${CALENDAR_SUBSCRIPTIONS_ENDPOINT}${subscriptionId}/refresh/`
    );

    return response.data;
}

export default refreshCalendarSubscription;
