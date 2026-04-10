/**
 * API configuration for HTTP requests.
 *
 * - api: used for authenticated requests (includes JWT token when set)
 * - publicApi: used for unauthenticated requests (e.g. login, signup)
 * - setAuthToken: adds/removes the Authorization header on the api instance
 *
 * On load, an existing access token (if any) is applied automatically.
 */


import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const ACCESS_TOKEN_KEY = 'access';

function buildApiClient() {
    return axios.create({
        baseURL: API_BASE
    });
}

export const api = buildApiClient();
export const publicApi = buildApiClient();

export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
    }

    delete api.defaults.headers.common.Authorization;
}

function applyStoredAuthToken() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
        setAuthToken(token);
    }
}

applyStoredAuthToken();
