import { useEffect, useState, useCallback } from 'react';
import getTimeBlocks from '../api/getTimeBlocks.js';
import mapTimeBlocks from '../../../../utils/Helpers/mapTimeBlocks.js';

/**
 * Fetches and manages the current user's time blocks.
 *
 * @returns {{
 *   blocks: Array|null,
 *   setBlocks: Function,
 *   error: string,
 *   loading: boolean,
 *   refetchBlocks: Function
 * }} Time block state, actions, and status flags
 */
function useTimeBlocks() {
    const [blocks, setBlocks] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const refetchBlocks = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getTimeBlocks();
            setBlocks(mapTimeBlocks(data));
        } catch {
            setError('Failed to load time blocks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetchBlocks();
    }, [refetchBlocks]);

    return { blocks, setBlocks, error, loading, refetchBlocks };
}

export default useTimeBlocks;
