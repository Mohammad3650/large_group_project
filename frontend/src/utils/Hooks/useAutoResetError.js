import { useEffect } from 'react';

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