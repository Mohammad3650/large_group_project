import { useState } from 'react';
import { formatApiError } from './errors';

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
 * @param {Function} validateForm - Returns an object of field errors
 * @param {Function} submitForm - Async function to run if validation passes
 * @returns {{
 *   errors: { fieldErrors: Object<string, string>, global: string[] },
 *   loading: boolean,
 *   handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>,
 *   setErrors: Function
 * }}
 */
function useAuthForm(validateForm, submitForm) {
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        if (loading) return;

        const fieldErrors = validateForm();
        const hasFieldErrors = Object.keys(fieldErrors).length > 0;

        if (hasFieldErrors) {
            setErrors({ fieldErrors, global: [] });
            return;
        }

        setErrors(initialErrors);
        setLoading(true);

        try {
            await submitForm();
        } catch (error) {
            setErrors(formatApiError(error));
        } finally {
            setLoading(false);
        }
    }

    return {
        errors,
        loading,
        handleSubmit,
        setErrors // do we need this in the components or just for testing?
    };
}

export default useAuthForm;
