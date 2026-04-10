import { useEffect, useState } from 'react';
import { getAccessToken } from './authStorage';

function getLoggedInStatus() {
    return Boolean(getAccessToken());
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

        window.addEventListener('auth-change', syncAuthStatus);
        window.addEventListener('storage', syncAuthStatus);

        return () => {
            window.removeEventListener('auth-change', syncAuthStatus);
            window.removeEventListener('storage', syncAuthStatus);
        };
    }, []);

    return isLoggedIn;
}

export default useAuthStatus;
