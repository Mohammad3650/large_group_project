import { api } from '../../api.js';

/**
 * Fetches the current user's username from the API.
 *
 * @returns {Promise<string>} The username of the current user
 */
async function getUsername() {
    const response = await api.get('/api/user/');
    return response.data.username;
}

export default getUsername;
