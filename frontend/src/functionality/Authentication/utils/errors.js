import axios from 'axios';

const FALLBACK_MESSAGE = 'Request failed.';

/**
 * Returns an empty error state with no field errors and no global messages.
 * @returns {{ fieldErrors: Record<string, string[]>, global: string[] }} Initial error state
 * 
 */
export function createInitialErrors() {
    return {
        fieldErrors: {},
        global: []
    };
}

/**
 * Returns the standard frontend error shape with a single global message.
 *
 * @param {string} message - Global error message to display
 * @returns {{ fieldErrors: Record<string, string[]>, global: string[] }}
 */

export function buildGlobalError(message) {
    return {
        fieldErrors: {},
        global: [message]
    };
}

/**
 * Returns whether given value is a non-null object
 * 
 * @param {unknown} value - Value to check
 * @return {boolean} 
 */
function isErrorObject(value) {
    return typeof value === 'object' && value !== null;
}

/**
 * Returns whether an error response object contains a DRF detail message
 * 
 * @param {Record<string, unknown>} data - Response data to check
 * @return {boolean}
 */
function hasDetailMessage(data) {
    return typeof data.detail === 'string';
}

/**
 * Handles DRF-style object errors and maps them into
 * field-level and global errors.
 *
 * @param {Record<string, unknown>} data - Error response object
 * @returns {{ fieldErrors: Record<string, string[]>, global: string[] }}
 */

function handleObjectErrors(data) {
    const out = {
        fieldErrors: {},
        global: []
    };

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
    if (isErrorObject(data) && hasDetailMessage(data)) {
        return buildGlobalError(data.detail);
    }

    if (isErrorObject(data)) {
        return handleObjectErrors(data);
    }

    return handlePrimitiveError(data);
}
