/**
 * Capitalises the first letter of a string.
 *
 * @param {string} string - The string to capitalise
 * @returns {string} The string with its first character capitalised
 */
function Capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default Capitalise;