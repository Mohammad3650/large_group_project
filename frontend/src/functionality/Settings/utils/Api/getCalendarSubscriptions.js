import { api } from '../../../../api.js';
import { CALENDAR_SUBSCRIPTIONS_ENDPOINT } from '../../../../constants/apiEndpoints.js';

/**
 * Fetch all saved calendar subscriptions for the current user.
 *
 * @returns {Promise<Array>}
 */
async function getCalendarSubscriptions() {
    const response = await api.get(CALENDAR_SUBSCRIPTIONS_ENDPOINT);
    return response.data;
}

export default getCalendarSubscriptions;