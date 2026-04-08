import { useState, useEffect } from 'react';
import getUserTimezone from '../utils/Helpers/getUserTimezone.js';
import './stylesheets/TimeBlockForm.css';
import { BLOCK_TYPES } from '../constants/blockTypes';
import GeneratorFormItem from './GeneratorFormItem.jsx';

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
        daily: true,
        timezone: getUserTimezone(),
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
            description: '',
            timezone: getUserTimezone(),
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
                description: '',
                timezone: getUserTimezone(),
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
        const k = {
            week_start: weekStart,
            week_end: weekEnd,
            even_spread: evenSpread,
            include_scheduled: includeScheduled,
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
                <GeneratorFormItem
                    key={index}
                    block={block}
                    index={index}
                    serverErrors={serverErrors}
                    updateBlock={updateBlock}
                    deleteBlock={deleteBlock}
                    blocksLength={blocks.length}
                />
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
