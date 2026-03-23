import toLocalDateTime from "./toLocalDateTime.js";

/**
 * Maps raw time block data into the standard format used by the calendar and dashboard.
 *
 * @param {Array} blocks - Raw time block data
 * @returns {Array} The mapped time blocks
 */
function mapTimeBlocks(blocks) {
    return blocks.map((block, index) => {
        const { zonedDateTime: start, localDate, localTime: startTime } = toLocalDateTime(block.date, block.start_time);
        const { zonedDateTime: end, localTime: endTime } = toLocalDateTime(block.date, block.end_time);

        return {
            id: block.id ?? index,
            name: block.name,
            title: block.name,
            date: localDate,
            startTime,
            endTime,
            start,
            end,
            location: block.location,
            blockType: block.block_type ? block.block_type.charAt(0).toUpperCase() + block.block_type.slice(1) : "N/A",
            description: block.description || "N/A",
            _options: { additionalClasses: [`sx-type-${block.block_type}`] },
        };
    });
}

export default mapTimeBlocks;