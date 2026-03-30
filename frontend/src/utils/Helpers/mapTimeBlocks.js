import toLocalDateTime from '../Formatters/toLocalDateTime.js';
import Capitalise from '../Formatters/capitalise.js';

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
        const {
            zonedDateTime: start,
            localDate,
            localTime: startTime
        } = toLocalDateTime(block.date, block.start_time);
        const { zonedDateTime: end, localTime: endTime } = toLocalDateTime(
            block.date,
            block.end_time
        );

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
            blockType: block.block_type ? Capitalise(block.block_type) : 'N/A',
            description: block.description || 'N/A',
            // _options is required by the schedule-x calendar library to apply custom CSS classes to events
            _options: { additionalClasses: [`sx-type-${block.block_type}`] }
        };
    });
}

export default mapTimeBlocks;
