import { useEffect, useState } from 'react';
import { api } from '../../../../api.js';
import mapTimeBlockToFormData from '../Formatters/mapTimeBlockToFormData';
import buildUpdatePayload from '../Helpers/buildUpdatePayload';

const FETCH_ERROR = 'Unable to load this time block.';
const UPDATE_ERROR = 'Failed to update time block.';


/**
 * Custom hook for managing the edit lifecycle of a time block.
 *
 * Responsibility:
 * - Fetches existing time block data
 * - Transforms API data into form-ready format
 * - Handles update requests to the backend
 * - Manages loading and server error state
 *
 * This keeps API and state logic separate from UI components.
 *
 * @param {string} id - The id of the time block to edit
 * @returns {{
 *   initialData: object|null,
 *   loading: boolean,
 *   serverErrors: object[],
 *   update: Function,
 *   clearErrors: Function
 * }}
 */
export default function useEditTimeBlock(id) {
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverErrors, setServerErrors] = useState([]);

    useEffect(() => {
        /**
         * Fetches the time block from the API and maps it to form-ready data.
         * Sets a fetch error in state if the request fails.
         * @returns {Promise<void>}
         */
        async function load() {
            try {
                const res = await api.get(`/api/time-blocks/${id}/edit`);
                setInitialData(mapTimeBlockToFormData(res.data));
            } catch {
                setServerErrors([{ detail: FETCH_ERROR }]);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    /**
     * Builds and sends a PATCH request to update the time block.
     * @param {object} block - The updated time block form data.
     * @returns {Promise<boolean>} True if the update succeeded, false if it failed.
     */
    async function update(block) {
        try {
            const payload = buildUpdatePayload(block);
            await api.patch(`/api/time-blocks/${id}/edit/`, payload);
            return true;
        } catch (error) {
            setServerErrors([
                error.response?.data || { detail: UPDATE_ERROR }
            ]);
            return false;
        }
    }

    /**
     * Clears all current server errors from state.
     * @returns {void}
     */
    function clearErrors() {
        setServerErrors([]);
    }

    return {
        initialData,
        loading,
        serverErrors,
        update,
        clearErrors
    };
}