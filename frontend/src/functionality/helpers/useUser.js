import { useState, useEffect } from "react";
import { api } from "../../api.js";

function useUser(isLoggedIn) {
    const [username, setUsername] = useState("");

    useEffect(() => {
        if (!isLoggedIn) return;
        async function fetchUser() {
            try {
                const res = await api.get("/api/user/");
                setUsername(res.data.username);
            } catch (err) {
                console.error("Failed to load user", err);
            }
        }
        fetchUser();
    }, [isLoggedIn]);

    return username;
}

export default useUser;