import { getAccessToken } from './authStorage.js';

export function hasAccessToken() {
    return Boolean(getAccessToken());
}