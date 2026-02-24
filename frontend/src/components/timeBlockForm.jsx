import { useState } from "react";
import "../timeBlockFormStyle.css";


function TimeBlockForm({ onSubmit, loading, serverErrors, clearErrors }) {

  const [date, setDate] = useState("");

  const [blocks, setBlocks] = useState([
    {
      date: "",
      name: "",
      location: "",
      block_type: "study",
      description: "",
      is_fixed: false,
      duration: "",
      time_of_day: "",
      start_time: "",
      end_time: "",
    }
  ]);

  function addBlock() {
    setBlocks([
      ...blocks,
      {
        date: "",
        name: "",
        location: "",
        block_type: "study",
        description: "",
        is_fixed: false,
        duration: "",
        time_of_day: "",
        start_time: "",
        end_time: "",
      }
    ]);
    clearErrors();
  }

  function updateBlock(index, field, value) {
    const updated = [...blocks];
    updated[index][field] = value;
    setBlocks(updated);
    clearErrors();
  }

  function deleteBlock(indexToDelete) {
  setBlocks(blocks.filter((_, index) => index !== indexToDelete));
  clearErrors();

  }

  function handleSubmit(e) {
    e.preventDefault();
  
    // Submit each block separately
    const dataList = blocks.map(block => {
        const data = {
          date: date,
          name: block.name,
          location: block.location,
          description: block.description,
          block_type: block.block_type,
          is_fixed: block.is_fixed,
        };
        if (block.is_fixed) {
          data.start_time = block.start_time;
          data.end_time = block.end_time;
        } else {
          data.duration = parseInt(block.duration);
          data.time_of_day_preference = block.time_of_day;  // note: renamed to match serializer
        }
        return data;
    });
    onSubmit(dataList);
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Date once for whole schedule */}
      {serverErrors[0]?.date && <p className="error-text-date">Date must be provided</p>}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />


      {blocks.map((block, index) => (
        <div key={index} className="time-block-section">

          {serverErrors[index]?.name && <p className="error-text">A name for the event must be provided</p>}
          <input
            placeholder="Name"
            value={block.name}
            onChange={(e) =>
              updateBlock(index, "name", e.target.value)
            }
          />

          {serverErrors[index]?.location && <p className="error-text">Location must be provided</p>}
          <input
            placeholder="Location"
            value={block.location}
            onChange={(e) =>
              updateBlock(index, "location", e.target.value)
            }
          />


          <select
            value={block.block_type}
            onChange={(e) =>
              updateBlock(index, "block_type", e.target.value)
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
            <option value="extracurricular">extracurricular</option>
          </select>

          <select
              value={block.is_fixed}
              onChange={(e) =>
                updateBlock(index, "is_fixed", e.target.value === "true")
              }
          >
              <option value="false"> Flexible </option>
              <option value="true"> Fixed </option>
          </select>

          { block.is_fixed ? (
              <>

              {serverErrors[index]?.start_time && <p className="error-text">A start time must be provided</p>}
              {serverErrors[index]?.non_field_errors && (<p className="error-text">A start time that is before the end time must be provided</p>)}
              <input
                  type="time"
                  value={block.start_time}
                  onChange={(e) =>
                    updateBlock(index, "start_time", e.target.value)
                  }
                />

              {serverErrors[index]?.end_time && <p className="error-text">An end time must be provided</p>}
              <input
                  type="time"
                  value={block.end_time}
                  onChange={(e) =>
                    updateBlock(index, "end_time", e.target.value)
                  }
              />

              </>
             ) : (
               <>

               <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={block.duration}
                  onChange={(e) =>
                    updateBlock(index, "duration", e.target.value)
                  }
              />

               {serverErrors[index]?.time_of_day_preference && <p className="error-text">A preference for time of day must be provided</p>}
               <select
                  value={block.time_of_day}
                  onChange={(e) =>
                    updateBlock(index, "time_of_day", e.target.value)
                  }
                >
                  <option value="">Preferred Time of Day</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
               </select>
               </>

              )}

              <textarea
                placeholder="Description (optional)"
                value={block.description}
                onChange={(e) => updateBlock(index, "description", e.target.value)}
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
      <button className="btn btn-secondary btn" type="button" onClick={addBlock}>
        Add Another Event
      </button>

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Saving..." : "Create Schedule"}
      </button>
    </div>

    </form>
  );
}

export default TimeBlockForm;


