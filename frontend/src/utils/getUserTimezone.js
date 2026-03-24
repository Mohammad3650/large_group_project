/**
 * Returns the user's current local timezone as an IANA timezone string.
 *
 * @returns {string} IANA timezone string (e.g. "Europe/London")
 */
function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export default getUserTimezone;