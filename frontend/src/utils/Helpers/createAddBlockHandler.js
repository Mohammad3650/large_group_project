import { addBlockToList } from "./addBlockToList";


/**
 * Creates a handler for adding a new block.
 *
 * @param {Function} setBlocks - React state setter for blocks.
 * @param {Function} clearErrors - Clears server errors.
 * @returns {Function} Add block handler.
 */
export function createAddBlockHandler(setBlocks, clearErrors) {
    return function addBlock() {
        setBlocks((currentBlocks) => addBlockToList(currentBlocks));
        clearErrors();
    };
}