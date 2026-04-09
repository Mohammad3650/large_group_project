import { updateBlockInList } from "./updateBlockInList";

/**
 * Creates a handler for updating a block field.
 *
 * @param {Function} setBlocks - React state setter for blocks.
 * @param {Function} clearErrors - Clears server errors.
 * @returns {Function} Update block handler.
 */
export function createUpdateBlockHandler(setBlocks, clearErrors) {
    return function updateBlock(index, field, value) {
        setBlocks((currentBlocks) =>
            updateBlockInList(currentBlocks, index, field, value)
        );
        clearErrors();
    };
}