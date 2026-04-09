import { useState } from 'react';
import { loginUser } from '../Auth/authService';
import useAuthForm from './useAuthForm';

/**
 * Hook that manages login form behaviour
 *  - state (email, password)
 *  - validation
 *  - submission
 * @param {function} nav 
 * @returns {Object} { email, setEmail, password, setPassword, errors, loading, handleSubmit }
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
    }
}

export default useLoginForm;