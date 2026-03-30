import { api } from '../../api.js';

const CALENDAR_SUBSCRIPTIONS_ENDPOINT = '/api/calendar-subscriptions';

/**
 * Delete a saved calendar subscription.
 *
 * @param {number} subscriptionId - The subscription ID
 * @returns {Promise<Object>} The API response data
 */
async function deleteCalendarSubscription(subscriptionId) {
    const response = await api.delete(
        `${CALENDAR_SUBSCRIPTIONS_ENDPOINT}/${subscriptionId}/`
    );

    return response.data;
}

export default deleteCalendarSubscription;
