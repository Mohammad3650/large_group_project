/**
 * Maps raw time block data into the standard format used by the calendar and dashboard.
 *
 * @param {Array} blocks - Raw time block data
 * @returns {Array} The mapped time blocks
 */
function mapTimeBlocks(blocks) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return blocks.map((block, index) => ({
        id: block.id ?? index,
        name: block.name,
        title: block.name,
        date: block.date,
        startTime: block.start_time.slice(0, 5),
        endTime: block.end_time.slice(0, 5),
        start: Temporal.ZonedDateTime.from(`${block.date}T${block.start_time.slice(0, 5)}[${timezone}]`),
        end: Temporal.ZonedDateTime.from(`${block.date}T${block.end_time.slice(0, 5)}[${timezone}]`),
        location: block.location,
        blockType: block.block_type ? block.block_type.charAt(0).toUpperCase() + block.block_type.slice(1) : "N/A",
        description: block.description || "N/A",
        _options: { additionalClasses: [`sx-type-${block.block_type}`] },
    }));
}

export default mapTimeBlocks;