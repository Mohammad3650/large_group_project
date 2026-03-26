import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import mapTimeBlocks from './mapTimeBlocks.js';

const TIME_BLOCKS_ENDPOINT = '/api/time-blocks/get/';

/**
 * Fetch and manage the current user's time blocks.
 *
 * @returns {Object} Time block state, actions, and status flags
 */
function useTimeBlocks() {
    const [blocks, setBlocks] = useState(null); // null = not yet fetched
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const refetchBlocks = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get(TIME_BLOCKS_ENDPOINT);
            setBlocks(mapTimeBlocks(response.data));
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
