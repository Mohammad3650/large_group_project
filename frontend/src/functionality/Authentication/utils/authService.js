import { publicApi } from '../../../api.js';
import { saveTokens } from './authStorage.js';

/**
 * Extracts tokens from API response,
 * saves them and returns auth data
 * @param {Object} response - The API response containing auth data
 * @returns {Object} Auth data including access, refresh tokens and user info
 */
function handleAuthResponse(response) {
    const { access, refresh, user } = response.data;
    saveTokens(access, refresh);
    return { access, refresh, user };
}

/**
 * Maps frontend signup form data
 * to backend API payload format
 * @param {Object} formData - The signup form data
 * @returns {Object} The formatted payload for the API
 */
function mapSignupPayload(formData) {
    return {
        email: formData.email,
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        password: formData.password
    };
}

/**
 * Logs in a user and stores tokens.
 *
 * @returns {Promise<{ access: string, refresh: string, user?: Object }>}
 */
export async function loginUser(email, password) {
    const response = await publicApi.post('/api/token/', {
        email,
        password
    });

    return handleAuthResponse(response);
}

/**
 * Registers a user and stores tokens.
 *
 * @returns {Promise<{ access: string, refresh: string, user?: Object }>}
 */
export async function signupUser(formData) {
    const payload = mapSignupPayload(formData);

    const response = await publicApi.post('/auth/signup/', payload);

    return handleAuthResponse(response);
}
