/**
 * Maps field errors from the API response to the profile form data structure.
 * @param {Object} data - The API response data containing field errors
 * @returns {Object} The mapped profile error state
 */

export function mapProfileFieldErrors(data) {
    const fieldErrors = {};

    for (const [field, value] of Object.entries(data)) {
        fieldErrors[field] = Array.isArray(value) ? value[0] : String(value);
    }

    return {
        fieldErrors,
        global: []
    };
}