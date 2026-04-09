/**
 * Manages the click handler for the pin button.
 *
 * @param {boolean} pinned - Whether the task is currently pinned
 * @param {Function} [onPin] - Callback to pin the task
 * @param {Function} [onUnpin] - Callback to unpin the task
 * @returns {Object} handleClick
 */
function usePinButton(pinned, onPin, onUnpin) {
    function handleClick(event) {
        event.stopPropagation();
        if (pinned) {
            onUnpin?.();
        } else {
            onPin?.();
        }
    }

    return { handleClick };
}

export default usePinButton;