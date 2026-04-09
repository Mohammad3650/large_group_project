import { LuPin } from 'react-icons/lu';
import '../stylesheets/TaskSection/PinButton.css';

/**
 * A toggle button that pins or unpins a task.
 * Displays a pin icon, styled to indicate the current pinned state.
 *
 * @param {Object} props
 * @param {boolean} props.pinned - Whether the task is currently pinned
 * @param {Function} [props.onPin] - Callback to pin the task
 * @param {Function} [props.onUnpin] - Callback to unpin the task
 * @returns {React.JSX.Element} The pin toggle button
 */
function PinButton({ pinned, onPin, onUnpin }) {
    function handleClick(e) {
        e.stopPropagation();
        if (pinned) {
            onUnpin?.();
        } else {
            onPin?.();
        }
    }

    return (
        <button
            className={`pin-button ${pinned ? 'pinned' : ''}`}
            onClick={handleClick}
        >
            <LuPin />
        </button>
    );
}

export default PinButton;
