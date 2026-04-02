import { api } from '../../api.js';

/**
 * Marks a time block as completed.
 *
 * @param {number} id - The ID of the time block to complete
 * @returns {Promise} The API response promise
 */
function completeTimeBlock(id) {
    if (!id) throw new Error('Invalid id');
    return api.patch(`/api/time-blocks/${id}/complete/`);
}

export default completeTimeBlock;
