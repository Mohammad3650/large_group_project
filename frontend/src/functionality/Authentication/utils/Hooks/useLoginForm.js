import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../authService.js';
import useAuthForm from './useAuthForm.js';
import validateLoginForm from '../Validation/validateLoginForm.js';

/**
 * Hook that manages login form state, validation and submission.
 * 
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


function useLoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function validateForm() {
        return validateLoginForm({ email, password });
    }

    async function submitLogin() {
        await loginUser(email, password);
        navigate('/dashboard');
    }

    const authForm = useAuthForm(validateForm, submitLogin);

    return {
        email,
        setEmail,
        password,
        setPassword,
        ...authForm
    };
}

export default useLoginForm;