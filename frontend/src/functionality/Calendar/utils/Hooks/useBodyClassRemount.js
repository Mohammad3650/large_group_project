import { useEffect } from 'react';

/**
 * Watches for changes to the body element's class attribute and remounts
 * the calendar by incrementing the calendar key whenever a change is detected.
 *
 * This prevents ScheduleX popup positioning errors that occur when the theme
 * is switched while a popup is open — remounting the calendar closes any
 * open popups before they can be misplaced.
 *
 * @param {Function} setCalendarKey - State setter used to increment the calendar
 *     remount key. Receives a functional update of the form prevKey => prevKey + 1.
 */
function useBodyClassRemount(setCalendarKey) {
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setCalendarKey(prevKey => prevKey + 1);
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, [setCalendarKey]);
}

export default useBodyClassRemount;
