/**
 * Maps raw time block data into the standard format used by the calendar and dashboard.
 *
 * @param {Array} blocks - Raw time block data
 * @returns {Array} The mapped time blocks
 */
function mapTimeBlocks(blocks) {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return blocks.map((block, index) => {
        // Interpret stored times as UTC then convert to user's local timezone
        const start = Temporal.ZonedDateTime.from(
            `${block.date}T${block.start_time.slice(0, 5)}[UTC]`
        ).withTimeZone(userTimezone);

        const end = Temporal.ZonedDateTime.from(
            `${block.date}T${block.end_time.slice(0, 5)}[UTC]`
        ).withTimeZone(userTimezone);

        // Recalculate date from converted start time in case UTC conversion crossed midnight
        const localDate = start.toPlainDate().toString();
        const startTime = `${String(start.hour).padStart(2, "0")}:${String(start.minute).padStart(2, "0")}`;
        const endTime = `${String(end.hour).padStart(2, "0")}:${String(end.minute).padStart(2, "0")}`;

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