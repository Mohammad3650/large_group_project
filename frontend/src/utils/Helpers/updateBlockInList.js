/**
 * Updates one field in one block.
 *
 * @param {Array} blocks - Existing blocks.
 * @param {number} index - Block index.
 * @param {string} field - Field name.
 * @param {string} value - New field value.
 * @returns {Array} Updated blocks.
 */
export function updateBlockInList(blocks, index, field, value) {
    return blocks.map((block, currentIndex) =>
        currentIndex === index
            ? { ...block, [field]: value }
            : block
    );
}