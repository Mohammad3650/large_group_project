/**
 * Logs an error when deleting a calendar event fails.
 *
 * @param {string|number} id - Unique identifier of the event that failed to delete
 * @param {Error} error - Error object returned from the failed delete operation
 * @returns {void}
 */
function logCalendarDeleteFailure(id, error) {
    console.error('Failed to delete event with ID', id, error);
}

export default logCalendarDeleteFailure;