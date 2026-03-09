/**
 * Formats a date string from ISO format into British date format.
 *
 * @param {string} date - Date string in ISO format (e.g. "2026-02-19")
 * @returns {string} Formatted date string in British format (e.g. "19/02/2026")
 */
const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};

export default formatDate;