import { publicApi } from '../../../api.js';
import { getAccessToken, logout } from './authStorage.js';

const VERIFY_ENDPOINT = '/api/token/verify/';
const INVALID_TOKEN_STATUSES = [401, 403];

/**
 * Verifies the token with the backend.
 *
 * @param {string} token
 * @returns {Promise<void>}
 */
async function verifyToken(token) {
    await publicApi.post(VERIFY_ENDPOINT, { token });
}

/**
 * Checks whether the token stored is valid
 * 
 * @param {number} status - HTTP status code from token verification error
 * @return {boolean} True if the status indicates an invalid/expired token, false otherwise
 */
function isInvalidTokenStatus(status) {
    return INVALID_TOKEN_STATUSES.includes(status);
}
/**
 * Checks whether the currently stored access token is still valid.
 *
 * Behavior:
 * - Reads the access token from local storage
 * - Returns false immediately if no token exists
 * - Sends the token to the backend verification endpoint
 * - Returns true if verification succeeds
 * - Logs the user out and returns false if verification fails
 *
 * Failure cases handled:
 * - missing token
 * - expired/invalid token (401/403)
 * - network/server errors
 *
 * @returns {Promise<boolean>} True if the token is valid, false otherwise
 */

export async function isTokenValid() {
    const token = getAccessToken();

    if (!token) return false;

    try {
        await verifyToken(token);
        return true;
    } catch (error) {
        const status = error?.response?.status;

        if (isInvalidTokenStatus(status)) {
            logout();
        }

        return false;
    }
}
