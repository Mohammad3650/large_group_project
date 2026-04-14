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
     * Generate schedule via API, store result in session, and navigate to preview.
     * @param {object} data - Schedule generation form data.
     * @returns {Promise<void>}
     */
    async function handleGenerate(data) {
        if (loading) return;

        setServerErrors({});
        setLoading(true);

        let allSuccess = true;
        let response = null;

        try {
            response = await generateSchedule(data);

            const events = response.data?.events || [];

            if (events.length === 0) {
                setServerErrors( { general: [ 'Unable to generate a schedule. Try changing your inputs and try again.']} );
                return;
            }
            setServerErrors({});
            sessionStorage.setItem(
                'generatedSchedule',
                JSON.stringify(response.data)
            );
            navigate('/preview-calendar');
        }
        catch(err){
            setServerErrors(err.response?.data || {});
            allSuccess = false;
        }
        finally{
            setLoading(false);
        }
    }

    return { handleGenerate, loading, serverErrors, setServerErrors };
}