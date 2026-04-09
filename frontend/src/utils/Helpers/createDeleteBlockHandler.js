import { deleteBlockFromList } from "./deleteBlockFromList";

/**
 * Creates a handler for deleting a block.
 *
 * @param {Function} setBlocks - React state setter for blocks.
 * @param {Function} clearErrors - Clears server errors.
 * @returns {Function} Delete block handler.
 */
export function createDeleteBlockHandler(setBlocks, clearErrors) {
    return function deleteBlock(indexToDelete) {
        setBlocks((currentBlocks) =>
            deleteBlockFromList(currentBlocks, indexToDelete)
        );
        clearErrors();
    };
}