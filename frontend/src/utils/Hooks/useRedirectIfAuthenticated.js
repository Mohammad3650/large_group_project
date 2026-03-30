import { useEffect } from 'react';
<<<<<<<< HEAD:frontend/src/utils/useAuthRedirect.js
import { isTokenValid } from './authToken';
========
import { isTokenValid } from '../Auth/authToken';
import { useNavigate } from 'react-router-dom';
>>>>>>>> origin:frontend/src/utils/Hooks/useRedirectIfAuthenticated.js

/**
 * Custom hook that redirects the user if they are already authenticated.
 *
 * Behavior:
 * - Checks if a valid authentication token exists
 * - If valid, redirects the user to a specified path (default: /dashboard)
 *
 * @param {Function} nav - The navigation function
 * @param {string} [path='/dashboard'] - Route to redirect authenticated users to
 */

function useAuthRedirect(nav, path = '/dashboard') {
    useEffect(() => {
        async function redirectUser() {
            const isAuthenticated = await isTokenValid();
            if (isAuthenticated) nav(path);
        }

        redirectUser();
    }, [nav, path]);
}

export default useAuthRedirect;
