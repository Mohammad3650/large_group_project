import { useState } from 'react';
import useNotes from '../../utils/Hooks/useNotes.js';
import useAutoSave from '../../utils/Hooks/useAutoSave.js';
import getNotesSaveStatusText from './utils/helpers/getNotesSaveStatusText.js';
import './stylesheets/NotesSection.css';

/**
 * Fetches and auto-saves the user's notes with a 1 second debounce.
 * Displays a save status indicator and handles loading and error states.
 *
 * @returns {JSX.Element} The notes section with a textarea and save status
 */
function NotesSection() {
    const { notes, setNotes, loaded, loading, error } = useNotes();
    const [saveStatus, setSaveStatus] = useState('');

    useAutoSave(notes, loaded, setSaveStatus);

    const statusText = getNotesSaveStatusText(saveStatus);

    if (loading) return <p className="notes-loading">Loading notes...</p>;
    if (error) return <p className="notes-error">{error}</p>;

    return (
        <div className="notes-section">
            <div className="notes-header">
                <span className={`save-status ${saveStatus === 'error' ? 'error' : ''}`}>
                    {statusText}
                </span>
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