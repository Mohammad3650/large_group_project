import { BLOCK_TYPES } from '../../constants/blockTypes';
import './stylesheets/TimeBlockItem.css';

/**
 * Renders a single time block form section.
 *
 * Responsibilities:
 * - Display inputs for a single block (name, location, type, time, description)
 * - Show validation errors for each field
 * - Handle updates to block state via updateBlock
 * - Allow deletion of the block when multiple blocks exist
 *
 * @param {Object} props - Component props
 * @param {Object} props.block - The current block data
 * @param {number} props.index - Index of the block in the blocks array
 * @param {Array} props.serverErrors - Validation errors from the backend
 * @param {Function} props.updateBlock - Function to update a block field
 * @param {Function} props.deleteBlock - Function to delete a block
 * @param {number} props.blocksLength - Total number of blocks
 * @returns {JSX.Element}
 */

function TimeBlockItem({
    block,
    index,
    serverErrors,
    updateBlock,
    deleteBlock,
    blocksLength
}) {
    return (
        <div className="time-block-section app-card">

            {serverErrors[index]?.name && (
            <p className="error-text">{serverErrors[index].name[0]}</p>
            )}
            <input
            placeholder="Name"
            value={block.name}
            onChange={(e) =>
                updateBlock(index, 'name', e.target.value)
            }
            />

            {serverErrors[index]?.location && (
            <p className="error-text">{serverErrors[index].location[0]}</p>
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
            {BLOCK_TYPES.map((type) => (
                <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
            ))}
            </select>

            <div className='time-row'>
                <label>
                    Start
                </label>

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
            </div>
            
            <div className='time-row'>
                <label>
                    End
                </label>
                
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
            </div>
            

            <textarea
            placeholder="Description (optional)"
            value={block.description}
            onChange={(e) =>
                updateBlock(index, 'description', e.target.value)
            }
            className="description-input"
            />

            {blocksLength > 1 && (
            <button
                type="button"
                onClick={() => deleteBlock(index)}
                className="delete-btn"
            >
                Delete Event
            </button>
            )}
        </div>
    );
}

export default TimeBlockItem;