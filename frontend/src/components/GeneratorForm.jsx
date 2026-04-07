import { useState, useEffect } from 'react';
import './stylesheets/TimeBlockForm.css';
import getUserTimezone from '../utils/Helpers/getUserTimezone.js';

/**
 * GeneratorForm renders schedule input fields and manages unscheduled block state.
 * Users can add / remove blocks, set week range, time windows, and global options.
 * @param {{onSubmit:function, loading:boolean, serverErrors:object, clearErrors:function}} props
 * @returns {JSX.Element}
 */
function GeneratorForm({ onSubmit, loading, serverErrors, clearErrors }) {
    const [weekStart, setWeekStart] = useState('');
    const [weekEnd, setWeekEnd] = useState('');
    const [evenSpread, setEvenSpread] = useState(false);
    const [includeScheduled, setIncludeScheduled] = useState(false);
    const [windows, setWindow] = useState({
        start_min: '',
        end_min: '',
        daily: true
    });

    const [blocks, setBlocks] = useState([
        {
            name: '',
            duration: '',
            frequency: '',
            daily: false,
            start_time_preference: 'None',
            location: '',
            block_type: 'study',
            description: ''
        }
    ]);

    /**
     * Add an empty event block to state and clear form errors.
     * @returns {void}
     */
    function addBlock() {
        setBlocks([
            ...blocks,
            {
                name: '',
                duration: '',
                frequency: '',
                daily: false,
                start_time_preference: 'None',
                location: '',
                block_type: 'study',
                description: ''
            }
        ]);
        clearErrors();
    }

    /**
     * Update a single field on a block and adjust daily frequency when needed.
     * @param {number} index
     * @param {string} field
     * @param {string|boolean} value
     * @returns {void}
     */
    function updateBlock(index, field, value) {
        const updated = [...blocks];
        updated[index][field] = value;
        if (field === 'daily') {
            updated[index].frequency = value ? '1' : '';
        }
        setBlocks(updated);
    }

    /**
     * Update the global window field value in state.
     * @param {string} field
     * @param {string} value
     * @returns {void}
     */
    function updateWindow(field, value) {
        setWindow((prev) => ({ ...prev, [field]: value }));
    }

    /**
     * Remove a block by index and reset errors.
     * @param {number} indexToDelete
     * @returns {void}
     */
    function deleteBlock(indexToDelete) {
        setBlocks(blocks.filter((_, index) => index !== indexToDelete));
        clearErrors();
    }

    /**
     * Toggle even spread and conditionally disable includeScheduled.
     * @param {boolean} checked
     * @returns {void}
     */
    function handleEvenSpreadChange(checked) {
        setEvenSpread(checked);
        if (!checked) setIncludeScheduled(false);
    }

    /**
     * Package form state and dispatch submit callback.
     * @returns {void}
     */
    function handleSubmit(e) {
        e.preventDefault();
        const timezone = getUserTimezone();
        const k = {
            week_start: weekStart,
            week_end: weekEnd,
            even_spread: evenSpread,
            include_scheduled: includeScheduled,
            timezone: timezone,
            windows: [windows],
            unscheduled: blocks
        };
        console.log(k);
        onSubmit(k);
    }

    useEffect(() => {
        clearErrors();
    }, []);

    return (
        <form onSubmit={handleSubmit}>
            {serverErrors?.general && (
                <p className="error-text">{serverErrors.general[0]}</p>
            )}

            {(serverErrors?.week_start || serverErrors?.week_end) && (
                <p className="error-text-date">
                    {serverErrors?.week_start?.[0] ||
                        serverErrors?.week_end?.[0]}
                </p>
            )}

            {/* Start and end dates */}
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

            {/* Global options */}
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

            {blocks.map((block, index) => (
                <div key={index} className="time-block-section">
                    {serverErrors.unscheduled?.[index]?.name && (
                        <p className="error-text">
                            {serverErrors.unscheduled[index].name[0]}
                        </p>
                    )}
                    <input
                        placeholder="Name"
                        value={block.name}
                        onChange={(e) =>
                            updateBlock(index, 'name', e.target.value)
                        }
                    />

                    {serverErrors.unscheduled?.[index]?.duration && (
                        <p className="error-text">
                            {serverErrors.unscheduled[index].duration[0]}
                        </p>
                    )}
                    <input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={block.duration}
                        onChange={(e) =>
                            updateBlock(index, 'duration', e.target.value)
                        }
                    />

                    {/* Daily checkbox + frequency */}
                    {serverErrors.unscheduled?.[index]?.daily && (
                        <p className="error-text">
                            {serverErrors.unscheduled[index].daily[0]}
                        </p>
                    )}
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={block.daily}
                            onChange={(e) =>
                                updateBlock(index, 'daily', e.target.checked)
                            }
                        />
                        Daily
                    </label>

                    {serverErrors.unscheduled?.[index]?.frequency && (
                        <p className="error-text">
                            {serverErrors.unscheduled[index].frequency[0]}
                        </p>
                    )}
                    <input
                        type="number"
                        placeholder="Frequency (times per week)"
                        value={block.frequency}
                        disabled={block.daily}
                        onChange={(e) =>
                            updateBlock(index, 'frequency', e.target.value)
                        }
                    />

                    {serverErrors.unscheduled?.[index]
                        ?.start_time_preference && (
                        <p className="error-text">
                            {
                                serverErrors.unscheduled[index]
                                    .start_time_preference[0]
                            }
                        </p>
                    )}
                    <select
                        value={block.start_time_preference}
                        placeholder="Start time preference"
                        onChange={(e) =>
                            updateBlock(
                                index,
                                'start_time_preference',
                                e.target.value
                            )
                        }
                    >
                        <option value="None">None</option>
                        <option value="Early">Early</option>
                        <option value="Late">Late</option>
                    </select>

                    {serverErrors.unscheduled?.[index]?.location && (
                        <p className="error-text">
                            {serverErrors.unscheduled[index].location[0]}
                        </p>
                    )}
                    <input
                        placeholder="Location"
                        value={block.location}
                        onChange={(e) =>
                            updateBlock(index, 'location', e.target.value)
                        }
                    />

                    {serverErrors.unscheduled?.[index]?.block_type && (
                        <p className="error-text">
                            {serverErrors.unscheduled[index].block_type[0]}
                        </p>
                    )}
                    <select
                        value={block.block_type}
                        onChange={(e) =>
                            updateBlock(index, 'block_type', e.target.value)
                        }
                    >
                        <option value="sleep">Sleep</option>
                        <option value="study">Study</option>
                        <option value="lecture">Lecture</option>
                        <option value="lab">Lab</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="commute">Commute</option>
                        <option value="exercise">Exercise</option>
                        <option value="break">Break</option>
                        <option value="work">Work</option>
                        <option value="extracurricular">Extracurricular</option>
                    </select>

                    <textarea
                        placeholder="Description (optional)"
                        value={block.description}
                        onChange={(e) =>
                            updateBlock(index, 'description', e.target.value)
                        }
                        className="description-input"
                    />

                    {blocks.length > 1 && (
                        <button
                            type="button"
                            onClick={() => deleteBlock(index)}
                            className="delete-btn"
                        >
                            Delete Event
                        </button>
                    )}
                </div>
            ))}

            <div className="time-block-form-btn">
                <button
                    className="btn btn-secondary btn"
                    type="button"
                    onClick={addBlock}
                >
                    Add Another Event
                </button>

                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner" /> Generating...
                        </>
                    ) : (
                        'Create Schedule'
                    )}
                </button>
            </div>
        </form>
    );
}

export default GeneratorForm;
