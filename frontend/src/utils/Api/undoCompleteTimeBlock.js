import { api } from '../../api.js';

/**
 * Marks a time block as not completed.
 *
 * @param {number} id - The ID of the time block to undo completion for
 * @returns {Promise} The API response promise
 */
function undoCompleteTimeBlock(id) {
    if (!id) throw new Error('Invalid id');
    return api.patch(`/api/time-blocks/${id}/undo-complete/`);
}

export default undoCompleteTimeBlock;
