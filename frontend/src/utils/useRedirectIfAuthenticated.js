import { useEffect } from 'react';
import { isTokenValid } from '../utils/authToken';

function useRedirectIfAuthenticated(navigate, path = '/dashboard') {
    useEffect(() => {
        async function redirectUser() {
            const isAuthenticated = await isTokenValid();
            if (isAuthenticated) navigate(path);
        }

        redirectUser();
    }, [navigate, path]);
}

export default useRedirectIfAuthenticated;
