import getUsername from '../Api/getUsername.js';

/**
 * Fetches the current user's username from the API and updates state accordingly.
 * Sets an error message if the response is invalid or the request fails.
 * Silently ignores cancelled requests.
 *
 * @param {Object} params
 * @param {Function} params.setUsername - Setter for the username state
 * @param {Function} params.setError - Setter for the error message state
 * @returns {Promise<void>}
 */
async function fetchUsername({ setUsername, setError }) {
    try {
        const username = await getUsername();
        if (!username) {
            setError('Invalid response from server');
            return;
        }
        setUsername(username);
    } catch (err) {
        if (err.name === 'CanceledError') return;
        setError('Failed to load user');
    }
}

export default fetchUsername;
