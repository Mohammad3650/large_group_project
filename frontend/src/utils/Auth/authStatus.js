import { useEffect, useState } from 'react';
import { addAuthChangeListener, removeAuthChangeListener } from './authEvents.js';
import { hasAccessToken } from './tokenPresence.js';
/**
 * Custom hook to determine whether a user is authenticated.
 *
 * Responsibilities:
 * - checks token validity on mount
 * - stores login state
 * - provides reusable auth status across components
 *
 * @returns {boolean} isLoggedIn - whether the user is authenticated
 */

function addStorageListener(listener) {
    window.addEventListener('storage', listener);
}

function removeStorageListener(listener) {
    window.removeEventListener('storage', listener);
}

function useAuthStatus() {
    const [isLoggedIn, setIsLoggedIn] = useState(hasAccessToken);

    useEffect(() => {
        function syncAuthStatus() {
            setIsLoggedIn(hasAccessToken());
        }

        addAuthChangeListener(syncAuthStatus);
        addStorageListener(syncAuthStatus);

        return () => {
            removeAuthChangeListener(syncAuthStatus);
            removeStorageListener(syncAuthStatus);
        };
    }, []);

    return isLoggedIn;
}

export default useAuthStatus;
