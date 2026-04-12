import { useEffect } from 'react';

/**
 * Closes a dropdown whenever the user's authentication status changes.
 *
 * @param {boolean} isLoggedIn - Whether the user is currently authenticated
 * @param {Function} setDropdownOpen - Setter to close the dropdown
 */
function useCloseOnAuthChange(isLoggedIn, setDropdownOpen) {
    useEffect(() => {
        setDropdownOpen(false);
    }, [isLoggedIn]);
}

export default useCloseOnAuthChange;