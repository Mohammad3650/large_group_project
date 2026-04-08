import { useState, useEffect } from 'react';
import './stylesheets/TimeBlockForm.css';
import getUserTimezone from '../utils/Helpers/getUserTimezone.js';
import { BLOCK_TYPES } from '../constants/blockTypes';
import TimeBlockItem from './TimeBlockItem';

/**
 * TimeBlockForm
 * Handles creation and editing of multiple time blocks for a schedule.
 * Props:
 * - onSubmit: function to submit data to parent component
 * - loading: boolean indicating if server call is in progress
 * - serverErrors: array of server validation errors per block
 * - clearErrors: function to clear server errors
 * - initialData: optional object for editing an existing block
 * - onCancel: optional function to cancel editing
 */
function TimeBlockForm({
    onSubmit,
    loading,
    serverErrors,
    clearErrors,
    initialData = null,
    onCancel = null

}) {
    const emptyBlock = {
    name: '',
    location: '',
    block_type: 'study',
    description: '',
    start_time: '',
    end_time: ''
    };

    const [date, setDate] = useState(initialData?.date || '');

    const [blocks, setBlocks] = useState(
        initialData
            ? [
                  {
                      id: initialData.id,
                      name: initialData.name,
                      location: initialData.location,
                      block_type: initialData.block_type,
                      description: initialData.description,
                      start_time: initialData.start_time || '',
                      end_time: initialData.end_time || ''
                  }
              ]
            : [
                  emptyBlock
              ]
    );

    useEffect(() => {
        if (initialData) {
            setDate(initialData.date || '');

            setBlocks([
                {
                    id: initialData.id,
                    name: initialData.name,
                    location: initialData.location,
                    block_type: initialData.block_type,
                    description: initialData.description,
                    start_time: initialData.start_time || '',
                    end_time: initialData.end_time || ''
                }
            ]);
        }
    }, [initialData]);

    /**
     * Adds a new empty time block to the form.
     * Also clears any existing server validation errors.
     */
    function addBlock() {
        setBlocks([
            ...blocks,
            emptyBlock
        ]);
        clearErrors();
    }

    /**
     * Updates a specific field of a time block at a given index.
     *
     * @param {number} index - The index of the block to update.
     * @param {string} field - The field name to update.
     * @param {string} value - The new value for the field.
     */
    function updateBlock(index, field, value) {
        const updated = [...blocks];
        updated[index][field] = value;
        setBlocks(updated);
        clearErrors();
    }

    /**
     * Removes a time block from the form by its index.
     * Also clears any existing server validation errors.
     *
     * @param {number} indexToDelete - The index of the block to remove.
     */
    function deleteBlock(indexToDelete) {
        setBlocks(blocks.filter((_, index) => index !== indexToDelete));
        clearErrors();
    }

    /**
     * Handles form submission.
     * Prevents default form behaviour, attaches the user's timezone,
     * formats all blocks into a list, and passes the data to the parent
     * component via the onSubmit prop.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
     */
    function handleSubmit(e) {
        e.preventDefault();
        const timezone = getUserTimezone();

        const dataList = blocks.map((block) => ({
                id: block.id,
                date: date,
                name: block.name,
                location: block.location,
                description: block.description,
                block_type: block.block_type,
                start_time: block.start_time,
                end_time: block.end_time,
                timezone: timezone
        }));
        onSubmit(dataList);
    }

    return (
        <form onSubmit={handleSubmit}>
            {serverErrors[0]?.date && (
                <p className="error-text-date"> {serverErrors[0].date[0]} </p>
            )}
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            {blocks.map((block, index) => (
                <TimeBlockItem
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

                {!initialData && (
                    <button
                        className="btn btn-secondary btn"
                        type="button"
                        onClick={addBlock}
                    >
                        Add Another Event
                    </button>
                )}

                {initialData && onCancel && (
                    <button
                        className="btn cancel-btn"
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}

                <button
                    className={`btn ${initialData ? 'edit-btn' : 'btn-primary'}`}
                    type="submit"
                    disabled={loading}
                >
                    {loading && 'Saving...'}
                    {!loading && initialData && 'Edit Time Block'}
                    {!loading && !initialData && 'Create Time Block'}
                </button>

            </div>
        </form>
    );
}

export default TimeBlockForm;
