import { useState } from 'react';
import { formatApiError } from './errors';

function createInitialErrors() {
    return {
        fieldErrors: {},
        global: []
    };
}

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
    const [errors, setErrors] = useState(createInitialErrors);
    const [loading, setLoading] = useState(false);

    function clearErrors() {
        setErrors(createInitialErrors());
    }

    function setValidationErrors(fieldErrors) {
        setErrors({
            fieldErrors,
            global: []
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) {
            return;
        }

        const fieldErrors = validateForm();

        if (Object.keys(fieldErrors).length > 0) {
            setValidationErrors(fieldErrors);
            return;
        }

        clearErrors();
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
        setErrors,
        clearErrors
    };
}

export default useAuthForm;