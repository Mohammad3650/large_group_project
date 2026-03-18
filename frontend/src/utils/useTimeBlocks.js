import { useEffect, useState } from "react";
import { api } from "../api.js";
import mapTimeBlocks from "./mapTimeBlocks.js";

/**
 * Fetches time blocks for the current user and maps them to a standard format.
 *
 * @returns {{ blocks: Array|null, setBlocks: Function, error: string }} The fetched blocks, setter, and error state
 */
function useTimeBlocks() {
    const [blocks, setBlocks] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchTimeBlocks() {
            try {
                const res = await api.get("/api/time-blocks/get/");
                setBlocks(mapTimeBlocks(res.data));
            } catch (err) {
                setError("Failed to load tasks");
            }
        }
        fetchTimeBlocks();
    }, []);

    return { blocks, setBlocks, error };
}

export default useTimeBlocks;