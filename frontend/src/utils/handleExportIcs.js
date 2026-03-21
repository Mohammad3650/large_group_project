import { api } from "../api.js";

const EXPORT_ICS_ENDPOINT = "/api/time-blocks/export/ics/";
const EXPORT_ICS_FILENAME = "studysync_schedule.ics";

/**
 * Export the user's schedule as an ICS file.
 *
 * @param {Function} setError - Error state setter
 * @returns {Promise<void>} Resolves when export completes
 */
async function handleExportIcs(setError) {
    try {
        const response = await api.get(EXPORT_ICS_ENDPOINT, {
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");

        link.href = url;
        link.setAttribute("download", EXPORT_ICS_FILENAME);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch {
        setError("Failed to export ICS");
    }
}

export default handleExportIcs;