import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import useAutoSave from '../../utils/Hooks/useAutoSave.js';
import './stylesheets/NotesSection.css';

/**
 * Fetches and auto-saves the user's notes with a 1 second debounce.
 * Displays a save status indicator and handles loading and error states.
 *
 * @returns {JSX.Element} The notes section with a textarea and save status
 */
function NotesSection() {
    const [notes, setNotes] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    useAutoSave(notes, loaded, setSaveStatus);

    useEffect(() => {
        async function fetchNotes() {
            try {
                const res = await api.get('/api/notes/get/');
                setNotes(res.data.content);
                setLoaded(true);
            } catch {
                setFetchError('Failed to load notes. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchNotes();
    }, []);

    if (loading) return <p className="notes-loading">Loading notes...</p>;
    if (fetchError) return <p className="notes-error">{fetchError}</p>;

    return (
        <div className="notes-section">
            <div className="notes-header">
                <span
                    className={`save-status ${saveStatus === 'error' ? 'error' : ''}`}
                >
                    {saveStatus === 'saving'
                        ? 'Saving...'
                        : saveStatus === 'error'
                            ? 'Error saving ✗'
                            : saveStatus === 'saved'
                                ? 'Saved ✓'
                                : '\u00A0'}
                </span>
            </div>
            <textarea
                className="notes-textarea"
                placeholder="Notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
            />
        </div>
    );
}

export default NotesSection;