import getUserTimezone from "./getUserTimezone";

/**
 * Builds the submit payload.
 *
 * @param {Array} blocks - Existing blocks.
 * @param {string} date - Selected date.
 * @returns {Array} Formatted payload.
 */
export function buildTimeBlockPayload(blocks, date) {
    const timezone = getUserTimezone();

    return blocks.map((block) => ({
        id: block.id,
        date,
        name: block.name,
        location: block.location,
        description: block.description,
        block_type: block.block_type,
        start_time: block.start_time,
        end_time: block.end_time,
        timezone
    }));
}
