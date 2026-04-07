import { api } from '../../api.js';

/**
 * Fetches the current user's data from the API.
 *
 * @returns {Promise<Object>} The user data object
 */
async function getUsername() {
    const response = await api.get('/api/user/');
    return response.data;
}

export default getUsername;
