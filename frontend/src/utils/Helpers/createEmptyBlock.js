/**
 * Creates an empty time block.
 *
 * @returns {Object} Empty time block object.
 */
export function createEmptyBlock() {
    return {
        name: '',
        location: '',
        block_type: 'study',
        description: '',
        start_time: '',
        end_time: ''
    };
}
