import { useState } from 'react';
import useNotes from './useNotes.js';
import useAutoSave from './useAutoSave.js';

/**
 * Manages all data fetching and state for the NotesSection component.
 *
 * @returns {Object} Notes data and state including notes, setNotes,
 * loading, error, and saveStatus.
 */
function useNotesSection() {
    const { notes, setNotes, loaded, loading, error } = useNotes();
    const [saveStatus, setSaveStatus] = useState('');

    useAutoSave(notes, loaded, setSaveStatus);

    return { notes, setNotes, loading, error, saveStatus };
}

export default useNotesSection;
