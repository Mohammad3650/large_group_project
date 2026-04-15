import { api } from '../../../../api.js';
import { CALENDAR_SUBSCRIPTIONS_ENDPOINT } from '../../../../constants/apiEndpoints.js';

/**
 * Create a new calendar subscription and import its events.
 *
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.sourceUrl
 * @returns {Promise<Object>}
 */
async function createCalendarSubscription({ name, sourceUrl }) {
    const response = await api.post(CALENDAR_SUBSCRIPTIONS_ENDPOINT, {
        name,
        source_url: sourceUrl
    });

    return response.data;
}

export default createCalendarSubscription;