import axios from 'axios';

const fallbackMessage = 'Request failed.';
const unknownErrorMessage = 'Something went wrong.';
const noResponseMessage = 'No response from server.';

/**
 * Returns the standard frontend error shape with a single global message.
 *
 * @param {string} message - Global error message to display
 * @returns {{ fieldErrors, global: string[] }}
 */

function buildGlobalError(message) {
    return {
        fieldErrors: {},
        global: [message]
    };
}

// Handle structured validation errors returned as an object
function isObject(value) {
    return typeof value === 'object' && value !== null;
}

// DRF common: { detail: "..." }
function hasDetailMessage(data) {
    return isObject(data) && typeof data.detail === 'string';
}

function getResponseData(err) {
    return err.response?.data;
}

function toMessageList(value) {
    return Array.isArray(value) ? value : [String(value)];
}

function isGlobalErrorKey(key) {
    return key === 'non_field_errors';
}

function addObjectError(out, key, value) {
    const messages = toMessageList(value);

    if (isGlobalErrorKey(key)) {
        out.global.push(...messages);
        return;
    }

    out.fieldErrors[key] = messages;
}

function isEmptyErrorShape(errorShape) {
    return (
        errorShape.global.length === 0 &&
        Object.keys(errorShape.fieldErrors).length === 0
    );
}

/**
 * Handles DRF-style object errors and maps them into
 * field-level and global errors.
 *
 * @param {Record<string, unknown>} data - Error response object
 * @returns {{ fieldErrors, global: string[] }}
 */

function handleObjectErrors(data) {
    const out = {
        fieldErrors: {},
        global: []
    };

    Object.entries(data).forEach(([key, value]) => {
        addObjectError(out, key, value);
    });

    if (isEmptyErrorShape(out)) {
        return buildGlobalError(fallbackMessage);
    }

    return out;
}

/**
 * Handles string or unexpected primitive response values.
 *
 * @param {unknown} data - Primitive response data
 * @returns {{ fieldErrors, global: string[] }}
 */

function handlePrimitiveError(data) {
    return buildGlobalError(typeof data === 'string' ? data : fallbackMessage);
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
 * @returns {{ fieldErrors, global: string[] }}
 */

function formatResponseDataError(data) {
    if (!data) {
        return buildGlobalError('No response from server.');
    }

    if (hasDetailMessage(data)) {
        return buildGlobalError(data.detail);
    }

    if (isObject(data)) {
        return handleObjectErrors(data);
    }

    return handlePrimitiveError(data);
}

export function formatApiError(err) {
    if (!axios.isAxiosError(err)) {
        return buildGlobalError('Something went wrong.');
    }

    return formatResponseDataError(getResponseData(err));
}