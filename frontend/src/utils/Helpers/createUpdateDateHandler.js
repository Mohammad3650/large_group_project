/**
 * Creates a handler for updating the date field.
 *
 * @param {Function} setDate - React state setter for date.
 * @param {Function} clearErrors - Clears server errors.
 * @returns {Function} Date change handler.
 */
export function createUpdateDateHandler(setDate, clearErrors) {
    return function updateDate(event) {
        setDate(event.target.value);
        clearErrors();
    };
}