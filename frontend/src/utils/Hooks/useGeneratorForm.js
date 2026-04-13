import { useState, useEffect } from 'react';
import getUserTimezone from '../Helpers/getUserTimezone.js';

/**
 * Custom hook for managing GeneratorForm state and logic.
 * @param {function} onSubmit
 * @param {boolean} loading
 * @param {object} serverErrors
 * @param {function} clearErrors
 * @returns {Object} State and functions for the form
 */
function useGeneratorForm(onSubmit, loading, serverErrors, clearErrors) {
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
        onSubmit(k);
    }

    useEffect(() => {
        clearErrors();
    }, []);

    return {
        weekStart,
        setWeekStart,
        weekEnd,
        setWeekEnd,
        evenSpread,
        handleEvenSpreadChange,
        includeScheduled,
        setIncludeScheduled,
        windows,
        updateWindow,
        blocks,
        updateBlock,
        deleteBlock,
        addBlock,
        handleSubmit,
        serverErrors,
    };
}

export default useGeneratorForm;