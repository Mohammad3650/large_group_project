import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid } from './authToken';

/**
 * Custom hook that redirects the user if they are already authenticated.
 *
 * Behavior:
 * - Checks if a valid authentication token exists
 * - If valid, redirects the user to a specified path (default: /dashboard)
 *
 * @param {string} path - Destination for authenticated users
 */
function useAuthRedirect(path = '/dashboard') {
    const navigate = useNavigate();

    useEffect(() => {
        async function redirectIfAuthenticated() {
            const isAuthenticated = await isTokenValid();

            if (isAuthenticated) {
                navigate(path);
            }
        }

        redirectIfAuthenticated();
    }, [navigate, path]);
}

export default useAuthRedirect;
