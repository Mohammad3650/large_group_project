import { api } from '../../../../api.js';

/**
 * Unpins a time block.
 *
 * @param {number} id - The ID of the time block to unpin
 * @returns {Promise} The API response promise
 */
function unpinTimeBlock(id) {
    if (!id) throw new Error('Invalid id');
    return api.patch(`/api/time-blocks/${id}/unpin/`);
}

export default unpinTimeBlock;