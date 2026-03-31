import { useState } from 'react';
import useAutoSave from '../../utils/Hooks/useAutoSave.js';
import './stylesheets/NotesSection.css';
import useNotes from '../../utils/Hooks/useNotes.js';

/**
 * Fetches and auto-saves the user's notes with a 1 second debounce.
 * Displays a save status indicator and handles loading and error states.
 * Shows a retry button when saving fails.
 *
 * @returns {JSX.Element} The notes section with a textarea and save status
 */
function NotesSection() {
    const { notes, setNotes, loaded, loading, error } = useNotes();
    const [saveStatus, setSaveStatus] = useState('');
    const { retrySave } = useAutoSave(notes, loaded, setSaveStatus);

    const statusText = {
        saving: 'Saving...',
        error: 'Error saving ✗',
        saved: 'Saved ✓',
    }[saveStatus] || '\u00A0';

    if (loading) return <p className="notes-loading">Loading notes...</p>;
    if (error) return <p className="notes-error">{error}</p>;

    return (
        <div className="notes-section">
            <div className="notes-header">
                <span className={`save-status ${saveStatus === 'error' ? 'error' : ''}`}>
                    {statusText}
                </span>
                {saveStatus === 'error' && (
                    <button className="notes-retry-button" onClick={retrySave}>
                        Retry
                    </button>
                )}
            </div>

            <textarea
                className="notes-textarea"
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>
    );
}

export default NotesSection;