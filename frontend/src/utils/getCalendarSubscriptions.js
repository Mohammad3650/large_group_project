import { api } from '../api.js';

const CALENDAR_SUBSCRIPTIONS_ENDPOINT = '/api/calendar-subscriptions/';

/**
 * Fetch all saved calendar subscriptions for the current user.
 *
 * @returns {Promise<Array>} The list of saved subscriptions
 */
async function getCalendarSubscriptions() {
    const response = await api.get(CALENDAR_SUBSCRIPTIONS_ENDPOINT);
    return response.data;
}

export default getCalendarSubscriptions;
