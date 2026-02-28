import { useState, useEffect } from "react";
import { api } from "../../api.js";

function getUser() {
    const [username, setUsername] = useState("");

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await api.get("/api/user/");
                setUsername(res.data.username);
            } catch (err) {
                console.error("Failed to load user", err);
            }
        }
        fetchUser();
    }, []);

    return username;
}

export default getUser;