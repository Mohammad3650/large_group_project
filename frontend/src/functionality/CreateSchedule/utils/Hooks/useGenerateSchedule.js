import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import generateSchedule from '../Api/generateSchedule.js';


/**
 * Generates a schedule via the API.
 * Handles loading state, server errors, session storage of the result,
 * and navigation to the preview page on success.
 * @returns {{
 *   handleGenerate: (data: object) => Promise<void>,
 *   loading: boolean,
 *   serverErrors: object,
 *   setServerErrors: (errors: object) => void
 * }}
 */
export function useGenerateSchedule() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState({});

    /**
     * Determines whether the API response contains no events.
     * @param {object} response - API response object.
     * @returns {boolean} True if no events are present, otherwise false.
     */
    function hasNoEvents(response) {
        return !response?.data?.events || response.data.events.length === 0;
    }

    /**
     * Sets a general error message when no schedule can be generated.
     * @returns {void}
     */
    function handleEmptyEvents() {
        setServerErrors({
            general: [
                'Unable to generate a schedule. Try changing your inputs and try again.'
            ]
        });
    }

    /**
     * Handles successful schedule generation:
     * - clears errors
     * - stores result in session storage
     * - navigates to preview page
     * @param {object} data - The generated schedule data.
     * @returns {void}
     */
    function handleSuccess(data) {
        setServerErrors({});
        sessionStorage.setItem(
            'generatedSchedule',
            JSON.stringify(data)
        );
        navigate('/preview-calendar');
    }

    /**
     * Handles API errors by updating server error state.
     * @param {object} err - Error object from API call.
     * @returns {void}
     */
    function handleError(err) {
        setServerErrors(err.response?.data || {});
    }

    /**
     * Generate schedule via API, store result in session, and navigate to preview.
     * @param {object} data - Schedule generation form data.
     * @returns {Promise<void>}
     */
    async function handleGenerate(data) {
        if (loading) return;

        setServerErrors({});
        setLoading(true);

        try {
            const response = await generateSchedule(data);

            if (hasNoEvents(response)) {
                handleEmptyEvents();
                return;
            }

            handleSuccess(response.data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    return { handleGenerate, loading, serverErrors, setServerErrors };
}