import { useState, useEffect } from 'react';
import './stylesheets/TimeBlockForm.css';
import getUserTimezone from '../utils/Helpers/getUserTimezone.js';

/**
 * TimeBlockForm
 * Handles creation and editing of multiple time blocks for a schedule.
 * Props:
 * - onSubmit: function to submit data to parent component
 * - loading: boolean indicating if server call is in progress
 * - serverErrors: array of server validation errors per block
 * - clearErrors: function to clear server errors
 * - initialData: optional object for editing an existing block
 */
function TimeBlockForm({
    onSubmit,
    loading,
    serverErrors,
    clearErrors,
    initialData = null
}) {
    const [date, setDate] = useState(initialData?.date || '');

    //Load initial data for timeblock and none if no data has been added(initial form entry)
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
                  {
                      date: '',
                      name: '',
                      location: '',
                      block_type: 'study',
                      description: '',
                      start_time: '',
                      end_time: ''
                  }
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
            {
                date: '',
                name: '',
                location: '',
                block_type: 'study',
                description: '',
                start_time: '',
                end_time: ''
            }
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

        // Submit each block separately
        const dataList = blocks.map((block) => {
            const data = {
                id: block.id,
                date: date,
                name: block.name,
                location: block.location,
                description: block.description,
                block_type: block.block_type,
                start_time: block.start_time,
                end_time: block.end_time,
                timezone: timezone
            };
            return data;
        });
        onSubmit(dataList);
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* Date once for whole schedule */}
            {serverErrors[0]?.date && (
                <p className="error-text-date"> {serverErrors[0].date[0]} </p>
            )}
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            {blocks.map((block, index) => (
                <div key={index} className="time-block-section app-card">
                    {serverErrors[index]?.name && (
                        <p className="error-text">
                            {serverErrors[index].name[0]}
                        </p>
                    )}
                    <input
                        placeholder="Name"
                        value={block.name}
                        onChange={(e) =>
                            updateBlock(index, 'name', e.target.value)
                        }
                    />

                    {serverErrors[index]?.location && (
                        <p className="error-text">
                            {serverErrors[index].location[0]}
                        </p>
                    )}
                    <input
                        placeholder="Location"
                        value={block.location}
                        onChange={(e) =>
                            updateBlock(index, 'location', e.target.value)
                        }
                    />

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

                    {serverErrors[index]?.start_time && (
                        <p className="error-text">
                            {serverErrors[index].start_time[0]}
                        </p>
                    )}
                    <input
                        type="time"
                        value={block.start_time}
                        onChange={(e) =>
                            updateBlock(index, 'start_time', e.target.value)
                        }
                    />

                    {serverErrors[index]?.end_time && (
                        <p className="error-text">
                            {serverErrors[index].end_time[0]}
                        </p>
                    )}
                    <input
                        type="time"
                        value={block.end_time}
                        onChange={(e) =>
                            updateBlock(index, 'end_time', e.target.value)
                        }
                    />

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
                {!initialData && (
                    <button
                        className="btn btn-secondary btn"
                        type="button"
                        onClick={addBlock}
                    >
                        Add Another Event
                    </button>
                )}

                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                >
                    {loading && 'Saving...'}
                    {!loading && initialData && 'Edit Schedule'}
                    {!loading && !initialData && 'Create Schedule'}
                </button>
            </div>
        </form>
    );
}

export default TimeBlockForm;
