import { api } from '../../../api.js';

const PROFILE_ENDPOINT = '/api/user/';
const DELETE_PROFILE_ENDPOINT = '/api/user/delete/';

/**
 * Creates an empty profile form data object with default values.
 * @returns {Object} An object representing empty profile form data
 */
export function createEmptyProfileFormData() {
    return {
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        phone_number: ''
    };
}

/**
 * Maps the API response data to the profile form data structure.
 * @param {Object} data - The API response data
 * @returns {Object} The mapped profile form data
 */
function mapProfileResponseToFormData(data = {}) {
    return {
        email: data.email || '',
        username: data.username || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || ''
    };
}

/**
 * Gets the current user's profile data from the API and maps it to the form data structure.
 * @returns {Promise<Object>} A promise resolving to the mapped profile form data
 */
export async function fetchProfileFormData() {
    const response = await api.get(PROFILE_ENDPOINT);
    return mapProfileResponseToFormData(response.data);
}

/**
 * Saves the updated profile data to the API.
 * @param {Object} formData - The updated profile form data
 * @returns {Promise<Object>} A promise resolving to the mapped profile form data
 */
export async function saveProfileFormData(formData) {
    const response = await api.put(PROFILE_ENDPOINT, formData);
    return mapProfileResponseToFormData(response.data);
}

/**
 * Deletes the user's profile account by making a DELETE request to the API.
 * @returns {Promise<void>} A promise that resolves when the account is deleted
 */
export async function deleteProfileAccount() {
    await api.delete(DELETE_PROFILE_ENDPOINT);
}