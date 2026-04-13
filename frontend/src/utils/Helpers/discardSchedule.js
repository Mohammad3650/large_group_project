/**
 * Discards the generated schedule and navigates to dashboard.
 * @param {Function} navigate - The navigation function.
 */
function discardSchedule(navigate) {
    sessionStorage.removeItem('generatedSchedule');
    navigate('/dashboard');
}

export default discardSchedule;