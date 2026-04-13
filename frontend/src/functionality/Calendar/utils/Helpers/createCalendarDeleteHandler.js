import deleteTimeBlock from '../../../../utils/Api/deleteTimeBlock.js';
import confirmEventDeletion from './confirmEventDeletion.js';
import removeCalendarEvent from './removeCalendarEvent.js';
import logCalendarDeleteFailure from './logCalendarDeleteFailure.js';

/**
 * Creates a handler function for deleting calendar events.
 * The handler confirms deletion, calls the delete API,
 * updates local state on success, and logs errors on failure.
 *
 * @param {Object} eventsService - Schedule-X events service plugin instance
 * @param {Function} setBlocks - State setter for updating calendar events
 * @param {Function} setCalendarKey - State setter used to force calendar rerender
 * @returns {Function} Handler that deletes a calendar event by id
 */
function createCalendarDeleteHandler(eventsService, setBlocks, setCalendarKey) {
    return (id) => {
        if (!confirmEventDeletion()) return;

        deleteTimeBlock(id)
            .then(() => removeCalendarEvent(id, eventsService, setBlocks, setCalendarKey))
            .catch((error) => logCalendarDeleteFailure(id, error));
    };
}

export default createCalendarDeleteHandler;