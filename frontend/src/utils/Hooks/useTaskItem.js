import { useState } from 'react';
import playDing from '../Audio/playDing.js';

/**
 * Manages state and completion logic for a task item.
 *
 * @param {Object} task - The task data object
 * @param {Function} [onComplete] - Callback to mark the task as completed
 * @param {boolean} completed - Whether the task is already completed
 * @returns {Object} id, name, date, startTime, endTime, checked, fading,
 * detailsOpen, setDetailsOpen, handleClick
 */
function useTaskItem(task, onComplete, completed) {
    const { id, name, date, startTime, endTime } = task;
    const [checked, setChecked] = useState(false);
    const [fading, setFading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    function handleClick() {
        if (checked || completed) return;
        playDing();
        setChecked(true);
        setFading(true);
        setTimeout(() => onComplete?.(), 500);
    }

    return { id, name, date, startTime, endTime, checked, fading, detailsOpen, setDetailsOpen, handleClick };
}

export default useTaskItem;