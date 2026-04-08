/**
 * GlobalOptions renders even spread and include scheduled checkboxes.
 * @param {Object} props
 * @param {boolean} props.evenSpread
 * @param {function} props.handleEvenSpreadChange
 * @param {boolean} props.includeScheduled
 * @param {function} props.setIncludeScheduled
 * @returns {JSX.Element}
 */
function GlobalOptions({ evenSpread, handleEvenSpreadChange, includeScheduled, setIncludeScheduled }) {
    return (
        <div className="global-options">
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={evenSpread}
                    onChange={(e) =>
                        handleEvenSpreadChange(e.target.checked)
                    }
                />
                Even Spread
            </label>

            <label
                className={`checkbox-label ${!evenSpread ? 'checkbox-label--disabled' : ''}`}
            >
                <input
                    type="checkbox"
                    checked={includeScheduled}
                    disabled={!evenSpread}
                    onChange={(e) => setIncludeScheduled(e.target.checked)}
                />
                Include Scheduled
            </label>
        </div>
    );
}

export default GlobalOptions;