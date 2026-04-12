import { useState } from 'react';

/**
 * Manages state and derived values for a collapsible task group.
 *
 * @param {string} variant - The task group variant (e.g. 'overdue', 'completed')
 * @returns {Object} isOpen, setIsOpen, overdue, completed
 */
function useTaskGroup(variant) {
    const [isOpen, setIsOpen] = useState(true);
    const overdue = variant === 'overdue';
    const completed = variant === 'completed';
    return { isOpen, setIsOpen, overdue, completed };
}

export default useTaskGroup;
