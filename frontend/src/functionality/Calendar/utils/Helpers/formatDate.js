/**
 * Converts a date from ISO format (YYYY-MM-DD)
 * into British format (DD/MM/YYYY).
 *
 * @param {string} date - Date in ISO format
 * @returns {string} Date in DD/MM/YYYY format
 */
function formatDate (date) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
};

export default formatDate;