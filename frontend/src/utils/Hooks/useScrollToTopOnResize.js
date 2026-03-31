import { useEffect } from 'react';

function useScrollToTopOnResize() {
    useEffect(() => {
        const handleResize = () => window.scrollTo(0, 0);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
}

export default useScrollToTopOnResize;