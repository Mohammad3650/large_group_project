import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling navigation related to editing a time block.
 *
 * Responsibility:
 * - Covers all routing logic for the edit flow
 * - Keeps navigation separate from UI components
 *
 * @param {string} id - The id of the time block being edited
 * @returns {{ goSuccess: Function, goCancel: Function }}
 */
function useEditTimeBlockNavigation(id) {
    const navigate = useNavigate();

    /**
     * Navigates to the success page after a time block has been edited.
     * @returns {void}
     */
    function goSuccess() {
        navigate('/successful-time-block', {
            state: { id, action: 'edited' }
        });
    }

    /**
     * Navigates back to the calendar page, discarding any changes.
     * @returns {void}
     */
    function goCancel() {
        navigate('/calendar');
    }

    return { goSuccess, goCancel };
}

export default useEditTimeBlockNavigation;