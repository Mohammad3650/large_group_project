import { api } from '../../../../api.js';

/**
 * Fetches the current user's time blocks from the API.
 *
 * @returns {Promise<Array>} The raw time block data
 */
async function getTimeBlocks() {
    const response = await api.get('/api/time-blocks/get/');
    return response.data;
}

export default getTimeBlocks;
