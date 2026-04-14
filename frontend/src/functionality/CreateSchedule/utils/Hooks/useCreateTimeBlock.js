import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../api.test.js';

/**
 * Creates one or more time block via the API.
 * Handles loading state, per-block server errors, and navigation on success.
 * @returns {{
 *   handleCreate: (dataList: object[]) => Promise<void>,
 *   loading: boolean,
 *   serverErrors: object[],
 *   setServerErrors: (errors: object[]) => void
 * }}
 */
export function useCreateTimeBlock() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState([]);

    /**
     * Submits a list of time block data objects to the API.
     * Cleans empty start_time and end_time strings to null before submission.
     * Navigates to the success page if all blocks are created successfully.
     * @param {object[]} dataList - Array of time block form data objects to create.
     * @param {string|null} dataList[].start_time - Start time string or empty string.
     * @param {string|null} dataList[].end_time - End time string or empty string.
     * @returns {Promise<void>}
     */
    async function handleCreate(dataList) {
        if (loading) return;

        setServerErrors([]);
        setLoading(true);

        const errors = [];
        let allSuccess = true;
        let createdBlockId = null;

        for (const data of dataList) {
            // ensure previousely allowed to be "" for start_time and end_time are now null for error handling
            const cleanedData = {
                ...data,
                start_time: data.start_time === '' ? null : data.start_time,
                end_time: data.end_time === '' ? null : data.end_time
            };

            try {
                const res = await api.post('/api/time-blocks/', cleanedData);
                errors.push({});
                if (!createdBlockId) createdBlockId = res.data.id;
            } 
            catch(err) {
                errors.push(err.response?.data || {});
                allSuccess = false;
            }
        }

        setServerErrors(errors);
        setLoading(false);

        if (allSuccess){
            navigate('/successful-time-block', {state: { id: createdBlockId } });
        }
    }

    return { handleCreate, loading, serverErrors, setServerErrors };
}