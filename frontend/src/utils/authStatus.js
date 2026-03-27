import { useEffect, useState } from 'react';
import { getAccessToken } from './authStorage';

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

function useAuthStatus() {
    const [isLoggedIn, setIsLoggedIn] = useState(() =>
        Boolean(getAccessToken())
    );

    useEffect(() => {
        function syncAuthStatus() {
            setIsLoggedIn(Boolean(getAccessToken()));
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
