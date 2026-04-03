import { useEffect } from 'react';
import { api } from '../../api.js';

/**
 * Auto-saves content to the API with a debounce delay.
 *
 * @param {string} content - The content to save
 * @param {boolean} loaded - Whether the initial content has been loaded
 * @param {Function} setSaveStatus - Setter for the save status indicator
 */
function useAutoSave(content, loaded, setSaveStatus) {
    useEffect(() => {
        if (!loaded) return;
        setSaveStatus('saving');

        const timer = setTimeout(async () => {
            try {
                await api.put('/api/notes/save/', { content });
                setSaveStatus('saved');
            } catch {
                setSaveStatus('error');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [content]);
}

export default useAutoSave;