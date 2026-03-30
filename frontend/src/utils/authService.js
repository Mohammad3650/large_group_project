import { publicApi } from '../api';
import { saveTokens } from './authStorage';

/**
 * Logs in a user and stores tokens.
 *
 * @returns {Promise<{ access: string, refresh: string, user?: Object }>}
 */
export async function loginUser(username, password) {
    const response = await publicApi.post('/auth/login/', {
        username,
        password
    });

    const { access, refresh, user } = response.data;
    saveTokens(access, refresh);

    return { access, refresh, user };
}

/**
 * Registers a user and stores tokens.
 *
 * @returns {Promise<{ access: string, refresh: string, user?: Object }>}
 */
export async function signupUser(formData) {
    const payload = {
        email: formData.email,
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        password: formData.password
    };

    const response = await publicApi.post('/auth/signup/', payload);
    const { access, refresh, user } = response.data;
    saveTokens(access, refresh);

    return { access, refresh, user };
}
