import { useState } from 'react';
import { formatApiError } from '../Errors/errors';

const initialErrors = {
    fieldErrors: {},
    global: []
};

/**
 * Reusable hook for async form submission.
 *
 * Responsibilities:
 * - runs client-side validation
 * - stores validation and API errors
 * - tracks loading state
 * - formats backend errors consistently
 *
 * @param {Function} validate - Returns an object of field errors
 * @param {Function} onSubmit - Async function to run if validation passes
 * @returns {{
 *   errors: { fieldErrors: Object<string, string>, global: string[] },
 *   loading: boolean,
 *   handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>,
 *   setErrors: Function
 * }}
 */
function useAuthForm(validate, onSubmit) {
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        if (loading) return;

        const fieldErrors = validate();
        if (Object.keys(fieldErrors).length) {
            setErrors({ fieldErrors, global: [] });
            return;
        }

        setErrors(initialErrors);
        setLoading(true);

        try {
            await onSubmit();
        } catch (err) {
            setErrors(formatApiError(err));
        } finally {
            setLoading(false);
        }
    }

    return {
        errors,
        loading,
        handleSubmit,
        setErrors
    };
}

export default useAuthForm;
