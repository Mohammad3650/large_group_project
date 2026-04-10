import { useState, useEffect, useRef } from 'react';
import isClickOutside from '../../functionality/Dashboard/utils/Helpers/isClickOutside.js';

/**
 * Custom hook to manage dropdown open/close state with click-outside detection.
 *
 * @returns {{ dropdownOpen: boolean, setDropdownOpen: Function, dropdownRef: React.RefObject }}
 */
function useDropdown() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (isClickOutside(dropdownRef, event)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return { dropdownOpen, setDropdownOpen, dropdownRef };
}

export default useDropdown;
