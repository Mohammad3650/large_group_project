import { useEffect } from 'react';
import { isTokenValid } from '../Auth/authToken';

/**
 * Custom hook that redirects the user if they are already authenticated.
 *
 * Behavior:
 * - Checks if a valid authentication token exists
 * - If valid, redirects the user to a specified path (default: /dashboard)
 *
 * @param {Function} navigate - The navigation function
 * @param {string} [path='/dashboard'] - Route to redirect authenticated users to
 */

function useAuthRedirect(navigate, path = '/dashboard') {
    useEffect(() => {
        async function redirectUser() {
            const isAuthenticated = await isTokenValid();
            if (isAuthenticated) navigate(path);
        }

        redirectUser();
    }, [navigate, path]);
}

export default useAuthRedirect;
