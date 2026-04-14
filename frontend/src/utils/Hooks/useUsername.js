import { useState, useEffect } from 'react';
import fetchUsername from '../Helpers/fetchUsername.js';

/**
 * Custom hook to fetch and return the current user's username from the API.
 * Only fetches when the user is confirmed to be logged in.
 *
 * @param {boolean} isLoggedIn - Whether the user is currently authenticated
 * @returns {{ username: string, error: string }} The username of the currently logged-in user
 * and an error message if the fetch failed
 */
function useUsername(isLoggedIn) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchUsername({ setUsername, setError });
    }, [isLoggedIn]);

    return { username, error };
}

export default useUsername;
