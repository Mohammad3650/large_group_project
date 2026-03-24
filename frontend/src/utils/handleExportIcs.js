import { api } from "../api.js";

async function handleExportIcs(setError) {
    try {
        const response = await api.get("/api/time-blocks/export/ics/", {
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "studysync_schedule.ics");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        setError("Failed to export ICS");
    }
}

export default handleExportIcs;