import { BLOCK_TYPES } from '../constants/blockTypes';

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