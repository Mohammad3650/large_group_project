import { useEffect, useState } from "react";
import { api } from "../../api.js";
import "./NotesSection.css";

/**
 * Fetches and auto-saves the user's notes with a 1 second debounce.
 * Displays a save status indicator when saving or saved.
 *
 * @returns {JSX.Element} The notes section with a textarea and save status
 */
function NotesSection() {
    const [notes, setNotes] = useState("");
    const [saveStatus, setSaveStatus] = useState("");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function fetchNotes() {
            try {
                const res = await api.get("/api/notes/");
                setNotes(res.data.content);
                setLoaded(true);
            } catch (err) {
                console.error("Failed to load notes", err);
            }
        }
        fetchNotes();
    }, []);

    useEffect(() => {
        if (!loaded) return;
        setSaveStatus("saving");
        const timer = setTimeout(async () => {
            try {
                await api.put("/api/notes/save/", { content: notes });
                setSaveStatus("saved");
            } catch (err) {
                console.error("Failed to save notes", err);
                setSaveStatus("error");
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [notes]);

    return (
        <div className="notes-section">
            <div className="notes-header">
                <span className={`save-status ${saveStatus === "error" ? "error" : ""}`}>
                    {saveStatus === "saving" ? "Saving..."
                    : saveStatus === "error" ? "Error saving ✗"
                    : saveStatus === "saved" ? "Saved ✓"
                    : "\u00A0"}
                </span>
            </div>
            <textarea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>
    );
}

export default NotesSection;