/**
 * GeneratorFormItem renders a single unscheduled time block form row
 * with fields for name, duration, daily/frequency, start time,
 * location, block type, and optional description.
 * @param {{block:object, index:number, serverErrors:object, updateBlock:function, deleteBlock:function, blocksLength:number}} props
 * @returns {JSX.Element}
 */
import { BLOCK_TYPES } from '../constants/blockTypes';
import Capitalise from '../utils/Formatters/capitalise';

function GeneratorFormItem({
    block,
    index,
    serverErrors,
    updateBlock,
    deleteBlock,
    blocksLength

}) {
    return(
        <div className="time-block-section">
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
                    className="checkbox-label-input"
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
                {BLOCK_TYPES.map((type) => (
                <option key={type} value={type}>
                {Capitalise(type)}
                </option>
                ))}
            </select>

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

export default GeneratorFormItem