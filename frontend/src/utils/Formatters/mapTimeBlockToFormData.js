import toLocalDateTime from './toLocalDateTime';

/**
 * Maps API time block data into the format expected by the form.
 *
 * Converts stored date + time into local date/time values
 * so the form displays correctly for the user.
 *
 * @param {object} data - Raw API response
 * @returns {object} Form-ready data
 */
export default function mapTimeBlockToFormData(data) {
    const start = toLocalDateTime(data.date, data.start_time);
    const end = toLocalDateTime(data.date, data.end_time);

    return {
        id: data.id,
        date: start.localDate,
        name: data.name,
        location: data.location,
        block_type: data.block_type,
        description: data.description,
        start_time: start.localTime,
        end_time: end.localTime
    };
}