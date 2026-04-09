/**
 * Deletes one block from the list.
 *
 * @param {Array} blocks - Existing blocks.
 * @param {number} indexToDelete - Block index to remove.
 * @returns {Array} Updated blocks.
 */
export function deleteBlockFromList(blocks, indexToDelete) {
    return blocks.filter((_, index) => index !== indexToDelete);
}