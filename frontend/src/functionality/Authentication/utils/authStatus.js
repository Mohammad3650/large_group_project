import { useEffect, useState } from 'react';
import { getAccessToken } from './authStorage';

const AUTH_STATUS_EVENTS = ['auth-change', 'storage'];

/**
 * Gets the current logged in status
 * @returns {boolean} - Whether the user is logged in
 */
function getLoggedInStatus() {
    return Boolean(getAccessToken());
}

/**
 * Subscribes to authentication status events
 * @param {Function} listener - The function to call when an event occurs
 */
function subscribeToAuthEvents(listener) {
    AUTH_STATUS_EVENTS.forEach((event) => {
        window.addEventListener(event, listener);
    });
}

/**
 * Unsubscribes from authentication status events
 * @param {Function} listener - The function to stop calling when an event occurs
 */
function unsubscribeFromAuthEvents(listener) {
    AUTH_STATUS_EVENTS.forEach((event) => {
        window.removeEventListener(event, listener);
    });
}

/**
 * Custom hook to determine whether an access token is currently stored
 *
 * Responsibilities:
 * - initialises login state from auth storage
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
