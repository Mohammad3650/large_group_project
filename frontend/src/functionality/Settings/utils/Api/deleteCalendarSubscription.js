import { api } from '../../../../api.js';
import { CALENDAR_SUBSCRIPTIONS_ENDPOINT } from '../../../../constants/apiEndpoints.js';

/**
 * Delete a saved calendar subscription.
 *
 * @param {number} subscriptionId
 * @returns {Promise<Object>}
 */
async function deleteCalendarSubscription(subscriptionId) {
    const response = await api.delete(
        `${CALENDAR_SUBSCRIPTIONS_ENDPOINT}${subscriptionId}/`
    );

    return response.data;
}

export default deleteCalendarSubscription;