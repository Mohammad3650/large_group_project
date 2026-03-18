import { useState, useEffect } from "react";
import { api } from "../api.js";

/**
 * Custom hook to fetch and return the current user's username from the API.
 * Only fetches when the user is confirmed to be logged in.
 *
 * @param {boolean} isLoggedIn - Whether the user is currently authenticated
 * @returns {string} The username of the currently logged-in user, or an empty string if not yet loaded
 */
function useUsername(isLoggedIn) {
    const [username, setUsername] = useState("");

    useEffect(() => {
        if (!isLoggedIn) return;
        async function fetchUsername() {
            try {
                const res = await api.get("/api/user/");
                setUsername(res.data.username);
            } catch (err) {
                console.error("Failed to load user", err);
            }
        }
        fetchUsername();
    }, [isLoggedIn]);

    return username;
}

export default useUsername;