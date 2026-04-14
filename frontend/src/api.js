import axios from 'axios';
import { ACCESS_KEY } from './constants/authKeys';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Axios instance for authenticated API requests.
 */
export const api = axios.create({
    baseURL: API_BASE
});

/**
 * Axios instance for unauthenticated API requests.
 */
export const publicApi = axios.create({
    baseURL: API_BASE
});

/**
 * Adds or removes the default Authorization header for the authenticated client
 * 
 * @param {string|null} token - JWT access token
 */
export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    }
    else {
        delete api.defaults.headers.common['Authorization'];
    }
}

function initialiseAuthToken() {
    const token = localStorage.getItem(ACCESS_KEY);

    if (token) {
        setAuthToken(token);
    }
}

initialiseAuthToken();