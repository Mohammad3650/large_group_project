/**
 * Returns the initial date for the form.
 *
 * @param {Object|null} initialData - Existing block data.
 * @returns {string} Initial date value.
 */
export function getInitialDate(initialData) {
    return initialData?.date || '';
}