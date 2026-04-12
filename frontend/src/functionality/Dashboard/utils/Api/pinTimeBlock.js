import { api } from '../../../../api.js';

/**
 * Pins a time block.
 *
 * @param {number} id - The ID of the time block to pin
 * @returns {Promise} The API response promise
 */
function pinTimeBlock(id) {
    if (!id) throw new Error('Invalid id');
    return api.patch(`/api/time-blocks/${id}/pin/`);
}

export default pinTimeBlock;