import { api } from '../../../api.js';

const PROFILE_ENDPOINT = '/api/user/';
const DELETE_PROFILE_ENDPOINT = '/api/user/delete/';

export function createEmptyProfileFormData() {
    return {
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        phone_number: ''
    };
}

function mapProfileResponseToFormData(data = {}) {
    return {
        email: data.email || '',
        username: data.username || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || ''
    };
}

export async function fetchProfileFormData() {
    const response = await api.get(PROFILE_ENDPOINT);
    return mapProfileResponseToFormData(response.data);
}

export async function saveProfileFormData(formData) {
    const response = await api.put(PROFILE_ENDPOINT, formData);
    return mapProfileResponseToFormData(response.data);
}

export async function deleteProfileAccount() {
    await api.delete(DELETE_PROFILE_ENDPOINT);
}