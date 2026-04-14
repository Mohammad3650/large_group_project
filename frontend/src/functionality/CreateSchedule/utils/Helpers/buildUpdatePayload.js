import getUserTimezone from '../../../../utils/Helpers/getUserTimezone';

/**
 * Converts empty time values into null
 * so the backend receives a consistent format.
 */
function normaliseTime(value) {
    return value === '' ? null : value;
}

/**
 * Builds the payload sent to the API when updating a time block.
 *
 * - Normalises optional times
 * - Adds user timezone for backend processing
 *
 * @param {object} block - Form data
 * @returns {object} API payload
 */
export default function buildUpdatePayload(block) {
    return {
        ...block,
        start_time: normaliseTime(block.start_time),
        end_time: normaliseTime(block.end_time),
        timezone: getUserTimezone()
    };
}