import { api } from '../../api.js';

const CALENDAR_SUBSCRIPTIONS_ENDPOINT = '/api/calendar-subscriptions/';

/**
 * Create a new calendar subscription and import its events.
 *
 * @param {Object} payload - The subscription payload
 * @param {string} payload.name - Display name for the subscription
 * @param {string} payload.sourceUrl - ICS/webcal URL to import
 * @returns {Promise<Object>} The API response data
 */
async function createCalendarSubscription({ name, sourceUrl }) {
    const response = await api.post(CALENDAR_SUBSCRIPTIONS_ENDPOINT, {
        name,
        source_url: sourceUrl
    });

    return response.data;
}

export default createCalendarSubscription;
