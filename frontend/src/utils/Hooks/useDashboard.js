import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';

function useDashboard() {
    const nav = useNavigate();
    const [message, setMessage] = useState('Loading...');
    const [error, setError] = useState('');

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

    return { message, error, setError };
}

export default useDashboard;