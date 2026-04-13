import { useState } from 'react';
import { loginUser } from './authService';
import useAuthForm from './useAuthForm';
import validateLoginForm from '../Validation/validateLoginForm';

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

function useLoginForm(navigate) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    async function submitLogin() {
        await loginUser(email, password);
        navigate('/dashboard');
    }

    const form = useAuthForm(
        () => validateLoginForm({ email, password }),
        submitLogin);

    return {
        email,
        setEmail,
        password,
        setPassword,
        ...form
    };
}

export default useLoginForm;