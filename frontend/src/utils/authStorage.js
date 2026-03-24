import { setAuthToken } from "../api";

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

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
 * Logs the user out by:
 * - removing stored tokens from localStorage
 * - clearing the default Authorization header used in API requests
 */

export function logout() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);

  // Remove auth header from future API requests
  setAuthToken(null);
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

  // Set auth header for subsequent API calls
  setAuthToken(access);
}