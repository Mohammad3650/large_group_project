import { useState, useEffect } from 'react';

/**
 * Determines whether a dropdown should open upwards based on available space below the trigger element.
 *
 * @param {boolean} dropdownOpen - Whether the dropdown is currently open
 * @param {Object} triggerRef - Ref to the trigger button element
 * @param {Object} containerRef - Ref to the container element holding the dropdown
 * @returns {boolean} Whether the dropdown should open upwards
 */
function useDropup(dropdownOpen, triggerRef, containerRef) {
    const [dropup, setDropup] = useState(false);

    useEffect(() => {
        if (dropdownOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdown = containerRef.current?.querySelector('.task-options-dropdown');
            const dropdownHeight = dropdown ? dropdown.getBoundingClientRect().height : 150;
            const padding = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--space-xl'));
            setDropup(spaceBelow < dropdownHeight + padding);
        }
    }, [dropdownOpen]);

    return dropup;
}

export default useDropup;