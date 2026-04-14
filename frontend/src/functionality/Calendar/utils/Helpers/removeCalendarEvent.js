/**
 * Removes a deleted event from the calendar service and local state,
 * and triggers a calendar rerender.
 *
 * @param {string|number} id - Unique identifier of the deleted event
 * @param {Object} eventsService - Schedule-X events service plugin instance
 * @param {Function} setBlocks - State setter for updating calendar events
 * @param {Function} setCalendarKey - State setter used to force calendar rerender
 * @returns {void}
 */

function removeCalendarEvent(id, eventsService, setBlocks, setCalendarKey) {
    eventsService.remove(id);
    setBlocks((block) => block.filter((block) => block.id !== id));
    setCalendarKey((key) => key + 1);
}

export default removeCalendarEvent;