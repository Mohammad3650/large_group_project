import { useEffect } from 'react';
import saveNotes from '../Api/saveNotes.js';

/**
 * Auto-saves content to the API with a debounce delay.
 *
 * @param {string} content - The content to save
 * @param {boolean} loaded - Whether the initial content has been loaded
 * @param {Function} setSaveStatus - Setter for the save status indicator
 * @returns {void}
 */
function useAutoSave(content, loaded, setSaveStatus) {
    useEffect(() => {
        if (!loaded) return;
        setSaveStatus('saving');

        const timer = setTimeout(async () => {
            try {
                await saveNotes(content);
                setSaveStatus('saved');
            } catch {
                setSaveStatus('error');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [content]);
}

export default useAutoSave;
