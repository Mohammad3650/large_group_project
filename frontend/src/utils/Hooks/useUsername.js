import { useState, useEffect } from 'react';
import getUsername from '../Api/getUsername.js';

/**
 * Custom hook to fetch and return the current user's username from the API.
 * Only fetches when the user is confirmed to be logged in.
 *
 * @param {boolean} isLoggedIn - Whether the user is currently authenticated
 * @returns {{ username: string, error: string }} The username of the currently logged-in user
 * and an error message if the fetch failed
 */

function hasValidUsername(username) {
    return Boolean(username);
}

function shouldIgnoreUsernameError(error) {
    return error.name === 'CanceledError';
}

async function loadUsername(setUsername, setError) {
    try {
        const username = await getUsername();

        if (!hasValidUsername(username)) {
            setError('Invalid response from server');
            return;
        }

        setUsername(username);
    } catch (error) {
        if (shouldIgnoreUsernameError(error)) {
            return;
        }

        setError('Failed to load user');
    }
}

function useUsername(isLoggedIn) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }

        loadUsername(setUsername, setError);
    }, [isLoggedIn]);

    return { username, error };
}

export default useUsername;
