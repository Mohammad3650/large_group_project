import { api } from '../../api.js';

/**
 * Fetches the user's notes content from the API.
 *
 * @returns {Promise<string>} The notes content
 */
async function getNotes() {
    const response = await api.get('/api/notes/get/');
    return response.data.content;
}

export default getNotes;
