import { setAuthToken } from "../api";

/**
 * Retrieves the stored access token from localStorage.
 *
 * @returns {string|null} The access token if present, otherwise null
 */

export function getAccessToken() {
  return localStorage.getItem("access");
}

/**
 * Retrieves the stored refresh token from localStorage.
 *
 * @returns {string|null} The refresh token if present, otherwise null
 */

export function getRefreshToken() {
  return localStorage.getItem("refresh");
}

/**
 * Logs the user out by:
 * - removing stored tokens from localStorage
 * - clearing the default Authorization header used in API requests
 */

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");

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
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);

  // Set auth header for subsequent API calls
  setAuthToken(access);
}