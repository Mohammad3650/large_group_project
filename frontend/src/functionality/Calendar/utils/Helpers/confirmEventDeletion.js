/**
 * Prompts the user to confirm deletion of a calendar event.
 *
 * @returns {boolean} True when the user confirms the deletion action.
 */

function confirmEventDeletion(){
    return confirm('Are you sure you want to delete this event?');
}

export default confirmEventDeletion;