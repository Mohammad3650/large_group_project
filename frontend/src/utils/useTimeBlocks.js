import { useEffect, useState } from "react";
import { api } from "../api.js";

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
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const timeBlocks = res.data.map(block => ({
                    id: block.id,
                    name: block.name,
                    title: block.name,
                    date: block.date,
                    // startTime/endTime: plain strings used to display the start and end times
                    startTime: (block.start_time).slice(0, 5),
                    endTime: (block.end_time).slice(0, 5),
                    // start/end: Temporal.ZonedDateTime objects required by schedule-x for calendar rendering
                    start: Temporal.ZonedDateTime.from(`${block.date}T${(block.start_time).slice(0, 5)}[${timezone}]`),
                    end: Temporal.ZonedDateTime.from(`${block.date}T${(block.end_time).slice(0, 5)}[${timezone}]`),
                    location: block.location,
                    blockType: block.block_type ? block.block_type.charAt(0).toUpperCase() + block.block_type.slice(1) : "N/A",
                    description: block.description || "N/A",
                    _options: { additionalClasses: [`sx-type-${block.block_type}`] },
                }));
                setBlocks(timeBlocks);
            } catch (err) {
                setError("Failed to load tasks");
            }
        }
        fetchTimeBlocks();
    }, []);

    return { blocks, setBlocks, error };
}

export default useTimeBlocks;