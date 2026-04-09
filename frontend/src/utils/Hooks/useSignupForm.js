import { useState } from 'react';
import { validateSignupForm } from '../Validation/signupValidation';
import { signupUser } from '../Auth/authService';
import useAuthForm from './useAuthForm';

/**
 * Initial form state for signup
 */
const initialForm = {
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
};

/**
 * Hook that manages signup form behaviour
 * - form state
 * - field updates
 * - validation
 * - submission
 * 
 * @param {function} nav - React router navigate function
 * @return {Object} Signup form state and handlers
 */

function useSignupForm(nav) {
    const [form, setForm] = useState(initialForm);

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
