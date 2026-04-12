import { useState } from 'react';
import { loginUser } from './authService';
import useAuthForm from './useAuthForm';

/**
 * Hook that manages login form state, validation and submission.
 * 
 * @param {function} nav - Navigation function from react-router 
 * @returns {Object} {{ 
 *      email: string, 
 *      setEmail: function, 
 *      password: string, 
 *      setPassword: function, 
 *      errors: {fieldErrors: Object, global: string[]}, 
 *      loading: boolean, 
 *      handleSubmit: function 
 * }}
 */

function useLoginForm(nav) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function validateLoginForm() {
        const fieldErrors = {};

        if (!email.trim()) fieldErrors.email = 'Email is required.';
        if (!password) fieldErrors.password = 'Password is required.';

        return fieldErrors;
    }

    async function submitLogin() {
        await loginUser(email, password);
        nav('/dashboard');
    }

    const form = useAuthForm(validateLoginForm, submitLogin);

    return {
        email,
        setEmail,
        password,
        setPassword,
        ...form
    };
}

export default useLoginForm;