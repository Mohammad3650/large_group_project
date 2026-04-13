import { useNavigate } from 'react-router-dom';

/**
 * Provides action handlers for editing and deleting a calendar event.
 *
 * @param {Object} params
 * @param {string|number} params.id - Unique identifier of the selected event
 * @param {Function} params.handleDelete - Function used to delete the event
 * @returns {Object} Handlers for editing the event and deleting it from the calendar.
 */
function useCalendarEventActions({calendarEvent: {id}, handleDelete }) {
    const navigate = useNavigate();

    function handleEdit(){
        navigate(`/timeblocks/${id}/edit`);
    }

    function handleDeleteEvent(){
        handleDelete(id);   
    };

    return{
        
            handleEdit,
            handleDeleteEvent
        
    };
}

export default useCalendarEventActions;