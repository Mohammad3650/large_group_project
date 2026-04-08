import { useEffect } from 'react';

/**
 * Scrolls the window to the top whenever it is resized.
 * Cleans up the event listener on unmount.
 */
function useScrollToTopOnResize() {
    useEffect(() => {
        const handleResize = () => window.scrollTo(0, 0);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
}

export default useScrollToTopOnResize;