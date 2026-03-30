import { useEffect } from 'react';
import { isTokenValid } from './authToken';

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
