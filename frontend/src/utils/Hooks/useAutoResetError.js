import { useEffect } from 'react';

/**
 * Automatically clears an error message after a given delay.
 *
 * @param {string} error - The current error message
 * @param {Function} setError - Setter function to clear the error
 * @param {number} [delay=5000] - Time in milliseconds before the error is cleared
 */
function useAutoResetError(error, setError, delay = 5000) {
    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => {
            setError('');
        }, delay);

        return () => clearTimeout(timer);
    }, [error]);
}

export default useAutoResetError;