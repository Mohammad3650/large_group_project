import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redirects after a trigger value becomes truthy.
 *
 * Responsibilities:
 * - waits for a truthy trigger value
 * - redirects after a configurable delay
 * - clears the timer on cleanup
 *
 * @param {string|boolean} trigger - Value that starts the redirect when truthy
 * @param {string} path - Route to navigate to
 * @param {number} delay - Delay in milliseconds before redirecting
 */
function useDelayedRedirect(trigger, path, delay) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!trigger) {
            return;
        }

        const timer = setTimeout(() => {
            navigate(path);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [trigger, path, delay, navigate]);
}

export default useDelayedRedirect;