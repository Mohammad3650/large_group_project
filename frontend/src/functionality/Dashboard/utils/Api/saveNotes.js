import { api } from '../../../../api.js';

/**
 * Saves notes content to the API.
 *
 * @param {string} content - The content to save
 * @returns {Promise} The API response promise
 */
async function saveNotes(content) {
    return api.put('/api/notes/save/', { content });
}

export default saveNotes;