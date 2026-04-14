import { useEffect, useState } from 'react';
import { isTokenValid } from '../authToken.js';

/**
 * Determines whether the current user can access a protected route.
 *
 * Returns:
 * - null while checking
 * - true when authenticated
 * - false when unauthenticated
 *
 * @returns {boolean|null}
 */
function useProtectedRouteAccess() {
    const [isAllowed, setIsAllowed] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function validateAccess() {
            const isValid = await isTokenValid();

            if (isMounted) {
                setIsAllowed(isValid);
            }
        }

        validateAccess();

        return () => {
            isMounted = false;
        };

    }, []);

    return isAllowed;
}

export default useProtectedRouteAccess;