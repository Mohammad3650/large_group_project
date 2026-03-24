import toLocalDateTime from "./toLocalDateTime.js";

/**
 * Build a local Temporal.ZonedDateTime from a YYYY-MM-DD date and HH:MM[:SS] time.
 *
 * @param {string} date - Event date
 * @param {string} time - Event time
 * @param {string} timezone - Browser timezone
 * @returns {Temporal.ZonedDateTime} Local zoned datetime
 */
function buildLocalZonedDateTime(date, time, timezone) {
    const trimmedTime = time.slice(0, 5);

    return Temporal.PlainDateTime
        .from(`${date}T${trimmedTime}:00`)
        .toZonedDateTime(timezone);
}

/**
 * Maps raw time block data into the standard format used by the calendar and dashboard.
 *
 * @param {Array<{
 *   id: number,
 *   name: string,
 *   date: string,
 *   start_time: string,
 *   end_time: string,
 *   location: string,
 *   block_type: string|null,
 *   description: string|null
 * }>} blocks - Raw time block data from the API
 * @returns {Array<{
 *   id: number|string,
 *   name: string,
 *   title: string,
 *   date: string,
 *   startTime: string,
 *   endTime: string,
 *   start: Temporal.ZonedDateTime,
 *   end: Temporal.ZonedDateTime,
 *   location: string,
 *   blockType: string,
 *   description: string,
 *   _options: {additionalClasses: string[]}
 * }>} The mapped time blocks
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