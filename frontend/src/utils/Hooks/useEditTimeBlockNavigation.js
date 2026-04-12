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

    function goSuccess() {
        navigate('/successful-time-block', {
            state: { id, action: 'edited' }
        });
    }

    function goCancel() {
        navigate('/calendar');
    }

    return { goSuccess, goCancel };
}

export default useEditTimeBlockNavigation;