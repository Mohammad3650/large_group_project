import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateSignupForm } from '../Validation/validateSignupForm.js';
import { signupUser } from '../authService.js';
import useAuthForm from './useAuthForm.js';

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

function useSignupForm() {
    const navigate = useNavigate();
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
        };
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