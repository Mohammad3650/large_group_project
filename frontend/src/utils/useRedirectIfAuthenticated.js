import { useEffect } from 'react';
import { isTokenValid } from '../utils/authToken';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook that redirects the user if they are already authenticated.
 *
 * Description:
 * - Checks if a valid authentication token exists
 * - If valid, redirects the user to a specified path (default: /dashboard)
 *
 * @param {string} [path='/dashboard'] - Route to redirect authenticated users to
 */

function useRedirectIfAuthenticated(path = '/dashboard') {
    const navigate = useNavigate();
    
    useEffect(() => {
        async function redirectUser() {
            const isAuthenticated = await isTokenValid();
            if (isAuthenticated) navigate(path);
        }

        redirectUser();
    }, [navigate, path]);
}

export default useRedirectIfAuthenticated;
