/**
 * DateRangeInput renders start and end date input fields.
 * @param {Object} props
 * @param {string} props.weekStart
 * @param {function} props.setWeekStart
 * @param {string} props.weekEnd
 * @param {function} props.setWeekEnd
 * @param {Object} props.serverErrors
 * @returns {JSX.Element}
 */
function DateRangeInput({ weekStart, setWeekStart, weekEnd, setWeekEnd, serverErrors }) {
    return (
        <>
            {(serverErrors?.week_start || serverErrors?.week_end) && (
                <p className="error-text-date">
                    {serverErrors?.week_start?.[0] ||
                        serverErrors?.week_end?.[0]}
                </p>
            )}

            <div className="range-box">
                <label>
                    Start
                    <input
                        type="date"
                        value={weekStart}
                        onChange={(e) => setWeekStart(e.target.value)}
                    />
                </label>
                <label>
                    End
                    <input
                        type="date"
                        value={weekEnd}
                        onChange={(e) => setWeekEnd(e.target.value)}
                    />
                </label>
            </div>
        </>
    );
}

export default DateRangeInput;