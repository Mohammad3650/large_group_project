/**
 * Returns the initial blocks for the form.
 *
 * @param {Object|null} initialData - Existing block data.
 * @returns {Array} Initial block array.
 */
export function getInitialBlocks(initialData) {
    if (!initialData) {
        return [createEmptyBlock()];
    }

    return [
        {
            id: initialData.id,
            name: initialData.name,
            location: initialData.location,
            block_type: initialData.block_type,
            description: initialData.description,
            start_time: initialData.start_time || '',
            end_time: initialData.end_time || ''
        }
    ];
}