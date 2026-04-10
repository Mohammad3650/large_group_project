import { useState } from 'react';
import { validateSignupForm } from '../Validation/signupValidation';
import { signupUser } from '../Auth/authService';
import useAuthForm from './useAuthForm';

/**
 * Initial field values for the signup form
 */
const INITIAL_FORM = {
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
};

/**
 * Hook that manages signup form state, validation and submission.
 * 
 * @param {function} nav - React router navigate function
 * @return {{
 *   form: {
 *      email: string, 
 *      username: string, 
 *      firstName: string, 
 *      lastName: string, 
 *      phoneNumber: string, 
 *      password: string, 
 *      confirmPassword: string
 *   },
 *   updateField: function,
 *   getFieldProps: function,
 *   errors: Object,
 *   loading: boolean,
 *   handleSubmit: function
 * }}
 */

function useSignupForm(nav) {
    const [form, setForm] = useState(INITIAL_FORM);

    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function validateForm() {
        return validateSignupForm(form);
    }

    async function submitSignup() {
        await signupUser(form);
        nav('/dashboard');
    }

    function getFieldProps(name) {
        return {
            value: form[name],
            onChange: (value) => updateField(name, value)
        }
    }

    const authForm = useAuthForm(validateForm, submitSignup);

    return {
        form,
        updateField,
        getFieldProps,
        ...authForm
    };
}

export default useSignupForm;
