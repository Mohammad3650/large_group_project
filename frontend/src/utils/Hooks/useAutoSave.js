import { useEffect, useCallback } from 'react';
import { api } from '../../api.js';

/**
 * Auto-saves content to the API with a debounce delay.
 * Also exposes a manual retry function for when saving fails.
 *
 * @param {string} content - The content to save
 * @param {boolean} loaded - Whether the initial content has been loaded
 * @param {Function} setSaveStatus - Setter for the save status indicator
 * @returns {{ retrySave: Function }} A function to manually retry saving
 */
function useAutoSave(content, loaded, setSaveStatus) {
    const retrySave = useCallback(async () => {
        setSaveStatus('saving');
        try {
            await api.put('/api/notes/save/', { content });
            setSaveStatus('saved');
        } catch (err) {
            console.error('Failed to save notes', err);
            setSaveStatus('error');
        }
    }, [content, setSaveStatus]);

    useEffect(() => {
        if (!loaded) return;
        setSaveStatus('saving');

        const timer = setTimeout(async () => {
            try {
                await api.put('/api/notes/save/', { content });
                setSaveStatus('saved');
            } catch (err) {
                console.error('Failed to save notes', err);
                setSaveStatus('error');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [content]);

    return { retrySave };
}

export default useAutoSave;