import { setAuthToken } from '../../../api';
import { ACCESS_KEY, REFRESH_KEY } from '../../../constants/authKeys';

const AUTH_CHANGE_EVENT = 'auth-change';

/**
 * Retrieves the stored access token from localStorage.
 *
 * @returns {string|null} The access token if present, otherwise null
 */

export function getAccessToken() {
    return localStorage.getItem(ACCESS_KEY);
}

/**
 * Retrieves the stored refresh token from localStorage.
 *
 * @returns {string|null} The refresh token if present, otherwise null
 */

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
}

/**
 * Notifies the app that authentication state has changed
 */
function notifyAuthChange() {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/**
 * Removes stored authentication tokens and clears auth header.
 */
export function clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAuthToken(null);
    notifyAuthChange();
}

/**
 * Logs the user out.
 */
export function logout() {
    clearTokens();
}

/**
 * Saves authentication tokens after login/signup.
 *
 * Flow:
 * - stores access and refresh tokens in localStorage
 * - sets the Authorization header for future API requests
 *
 * @param {string} access - JWT access token
 * @param {string} refresh - JWT refresh token
 */

export function saveTokens(access, refresh) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    setAuthToken(access);
    notifyAuthChange();
}
