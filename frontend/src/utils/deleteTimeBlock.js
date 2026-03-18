import { api } from "../api.js";

/**
 * Deletes a time block by ID.
 *
 * @param {number} id - The ID of the time block to delete
 * @returns {Promise} The API response promise
 */
function deleteTimeBlock(id) {
    return api.delete(`/api/time-blocks/${id}/`);
}

export default deleteTimeBlock;