import { useEffect } from 'react';

/**
 * Adds a CSS class to the document body on mount and removes it on unmount.
 *
 * @param {string} className - The CSS class to add to the body
 */
function useBodyClass(className) {
    useEffect(() => {
        document.body.classList.add(className);
        return () => document.body.classList.remove(className);
    }, [className]);
}

export default useBodyClass;