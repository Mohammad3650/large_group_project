import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';

/**
 * Custom hook to fetch the dashboard welcome message.
 *
 * @param {Function} setError - Setter function for the parent error state
 * @returns {{ message: string }}
 */
function useDashboard(setError) {
    const nav = useNavigate();
    const [message, setMessage] = useState('Loading...');

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const response = await api.get('/dashboard/');
                setMessage(response.data.message);
            } catch (err) {
                if (err?.response?.status === 401) {
                    nav('/login');
                } else {
                    setError('Failed to load dashboard');
                }
            }
        }
        fetchDashboard();
    }, [nav]);

    return { message };
}

export default useDashboard;