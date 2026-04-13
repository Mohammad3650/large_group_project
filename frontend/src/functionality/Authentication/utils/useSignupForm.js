import { useState } from 'react';
import { validateSignupForm } from './validateSignupForm';
import { signupUser } from './authService';
import useAuthForm from './useAuthForm';

/**
 * Initial field values for the signup form
 */
function createInitialSignupForm() {
    return {
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    };
}

function updateSignupFormField(form, name, value) {
    return {
        ...form,
        [name]: value
    };
}

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

function useSignupForm(navigate) {
    const [form, setForm] = useState(createInitialSignupForm());

    function updateField(name, value) {
        setForm((previousForm) => updateSignupFormField(previousForm, name, value));
    }

    function validateForm() {
        return validateSignupForm(form);
    }

    async function submitSignup() {
        await signupUser(form);
        navigate('/dashboard');
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
