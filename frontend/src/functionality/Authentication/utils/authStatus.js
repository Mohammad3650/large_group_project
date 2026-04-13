import { useEffect, useState } from 'react';
import { getAccessToken } from './authStorage';

const AUTH_STATUS_EVENTS = ['auth-change', 'storage'];

function getLoggedInStatus() {
    return Boolean(getAccessToken());
}

function subscribeToAuthEvents(listener) {
    AUTH_STATUS_EVENTS.forEach((event) => {
        window.addEventListener(event, listener);
    });
}

function unsubscribeFromAuthEvents(listener) {
    AUTH_STATUS_EVENTS.forEach((event) => {
        window.removeEventListener(event, listener);
    });
}

/**
 * Custom hook to determine whether an access token is currently stored
 *
 * Responsibilities:
 * - intilialises login state from auth storage
 * - updates login state when auth-related storage changes
 * - provides reusable auth status across components
 *
 * @returns {boolean} isLoggedIn - whether the user is authenticated
 */

function useAuthStatus() {
    const [isLoggedIn, setIsLoggedIn] = useState(getLoggedInStatus());

    useEffect(() => {
        function syncAuthStatus() {
            setIsLoggedIn(getLoggedInStatus());
        }

        subscribeToAuthEvents(syncAuthStatus);

        return () => {
            unsubscribeFromAuthEvents(syncAuthStatus);
        };
    }, []);

    return isLoggedIn;
}

export default useAuthStatus;
