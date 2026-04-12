/**
 * TimeWindowInput renders wake up and sleep time input fields.
 * @param {Object} props
 * @param {Object} props.windows
 * @param {function} props.updateWindow
 * @param {Object} props.serverErrors
 * @returns {JSX.Element}
 */
function TimeWindowInput({ windows, updateWindow, serverErrors }) {
    return (
        <>
            {(serverErrors.windows?.[0]?.start_min ||
                serverErrors.windows?.[0]?.end_min) && (
                <p className="error-text-date">
                    {serverErrors.windows?.[0]?.start_min?.[0] ||
                        serverErrors.windows?.[0]?.end_min?.[0]}
                </p>
            )}

            <div className="range-box">
                <label>
                    Wake Up
                    <input
                        type="time"
                        value={windows.start_min}
                        onChange={(e) =>
                            updateWindow('start_min', e.target.value)
                        }
                    />
                </label>

                <label>
                    Sleep
                    <input
                        type="time"
                        value={windows.end_min}
                        onChange={(e) =>
                            updateWindow('end_min', e.target.value)
                        }
                    />
                </label>
            </div>
        </>
    );
}

export default TimeWindowInput;