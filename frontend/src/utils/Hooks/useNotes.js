import { useEffect, useState } from 'react';
import { api } from '../../api.js';

function useNotes() {
    const [notes, setNotes] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchNotes() {
            try {
                const res = await api.get('/api/notes/get/');
                setNotes(res.data.content);
                setLoaded(true);
            } catch {
                setError('Failed to load notes. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchNotes();
    }, []);

    return {
        notes,
        setNotes,
        loaded,
        loading,
        error,
    };
}

export default useNotes;
