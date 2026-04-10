const AUTH_CHANGE_EVENT = 'auth-change';

export function dispatchAuthChange() {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function addAuthChangeListener(listener) {
    window.addEventListener(AUTH_CHANGE_EVENT, listener);
}

export function removeAuthChangeListener(listener) {
    window.removeEventListener(AUTH_CHANGE_EVENT, listener);
}