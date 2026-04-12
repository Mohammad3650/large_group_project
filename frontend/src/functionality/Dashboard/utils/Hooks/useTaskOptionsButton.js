import useDropdown from '../../../../utils/Hooks/useDropdown.js';

/**
 * Manages state and event handling for the task options button.
 *
 * @returns {Object} dropdownOpen, setDropdownOpen, dropdownRef, handleOptionsClick
 */
function useTaskOptionsButton() {
    const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();

    function handleOptionsClick(event) {
        event.stopPropagation();
        setDropdownOpen((prev) => !prev);
    }

    return { dropdownOpen, setDropdownOpen, dropdownRef, handleOptionsClick };
}

export default useTaskOptionsButton;