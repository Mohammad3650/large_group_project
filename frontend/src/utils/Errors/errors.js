import axios from 'axios';

const FALLBACK_MESSAGE = 'Request failed.';
/**
 * Returns the standard frontend error shape with a single global message.
 *
 * @param {string} message - Global error message to display
 * @returns {{ fieldErrors: Record<string, string[]>, global: string[] }}
 */

function buildGlobalError(message) {
    return {
        fieldErrors: {},
        global: [message]
    };
}

/**
 * Handles DRF-style object errors and maps them into
 * field-level and global errors.
 *
 * @param {Record<string, unknown>} data - Error response object
 * @returns {{ fieldErrors: Record<string, string[]>, global: string[] }}
 */

function handleObjectErrors(data) {
    const out = { fieldErrors: {}, global: [] };

    for (const [key, value] of Object.entries(data)) {
        const messages = Array.isArray(value) ? value : [String(value)];
        if (key === 'non_field_errors') {
            out.global.push(...messages);
        } else {
            out.fieldErrors[key] = messages;
        }
    }

    if (!out.global.length && !Object.keys(out.fieldErrors).length) {
        return buildGlobalError(FALLBACK_MESSAGE);
    }

    return out;
}

/**
 * Handles string or unexpected primitive response values.
 *
 * @param {unknown} data - Primitive response data
 * @returns {{ fieldErrors: Record<string, string[]>, global: string[] }}
 */

function handlePrimitiveError(data) {
    return buildGlobalError(typeof data === 'string' ? data : FALLBACK_MESSAGE);
}

/**
 * Converts API errors into a consistent structure for the frontend.
 *
 * Returned structure:
 * -- fieldErrors: maps field names to an array of messages
 * -- global: array of general error messages not tied to one field
 *
 * Handles several common cases:
 * -- non-Axios errors
 * -- missing server response
 * -- DRF "detail" responses
 * -- DRF field validation errors
 * -- DRF non_field_errors
 * -- plain string responses
 *
 * @param {unknown} err - Error thrown during an API request
 * @returns {{ fieldErrors: Record<string, string[]>, global: string[] }}
 */

export function formatApiError(err) {
    if (!axios.isAxiosError(err)) {
        return buildGlobalError('Something went wrong.');
    }

    const data = err.response?.data;

    if (!data) {
        return buildGlobalError('No response from server.');
    }

    // DRF common: { detail: "..." }
    if (typeof data === 'object' && typeof data.detail === 'string') {
        return buildGlobalError(data.detail);
    }

    if (typeof data === 'object' && data !== null) {
        return handleObjectErrors(data);
    }

    return handlePrimitiveError(data);
}
