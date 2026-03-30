import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage dropdown open/close state with click-outside detection.
 *
 * @returns {{ dropdownOpen: boolean, setDropdownOpen: Function, dropdownRef: Object }}
 */
function useDropdown() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return { dropdownOpen, setDropdownOpen, dropdownRef };
}

export default useDropdown;