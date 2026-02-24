import { useState } from "react";
import "../timeBlockFormStyle.css";


function TimeBlockForm({ onSubmit, loading }) {

  const [date, setDate] = useState("");

  const [frequency, setFrequency] = useState("none");

  const [errors, setErrors] = useState({});

  const [blocks, setBlocks] = useState([
    {
      date: "",
      frequency: "none",
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
    setErrors(prev => ({
    ...prev,
    blocks: [...(prev.blocks || []), {}]
    }));
  }

  function updateBlock(index, field, value) {
    const updated = [...blocks];
    updated[index][field] = value;
    setBlocks(updated);
  }

  function deleteBlock(indexToDelete) {
    setBlocks(blocks.filter((_, index) => index !== indexToDelete));

    setErrors(prev => ({
    ...prev,
    blocks: prev.blocks.filter((_, index) => index !== indexToDelete) || []
    }));
  }

  function validate() {
      let newErrors = {};
      let blockErrors = [];
      let isValid = true;

      if (!date) {
        newErrors.date = "Date is required";
        isValid = false;
      }

      if (!frequency) {
        newErrors.frequency = "Frequency of this event occurs is required";
        isValid = false;
      }

      blocks.forEach((block, index) => {
        let currentBlockErrors = {};

        if(!block.location) {
            currentBlockErrors.location = "Location is required";
            isValid = false;
        }

        if(!block.block_type) {
            currentBlockErrors.block_type = "A type of block is required";
            isValid = false;
        }

        if(block.is_fixed && (!block.start_time || !block.end_time)){
            currentBlockErrors.start_time = "A start time is required for fixed blocks";
            currentBlockErrors.end_time = "An end time is required for fixed blocks";
            isValid = false;
        }

        if(!block.is_fixed && (!block.duration || !block.time_of_day)){
            currentBlockErrors.duration = "You must provide the duration for this fixed event";
            currentBlockErrors.time_of_day = "You must provide a preference for when you would like to get this flexible event scheduled";
            isValid = false;
        }

        blockErrors[index] = currentBlockErrors;
      });

      newErrors.blocks = blockErrors;

      setErrors(newErrors);

      return isValid;

  }


  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setErrors({}); // clear errors if valid
  
    // Submit each block separately
    blocks.forEach(block => {
      onSubmit({
        date: date,
        frequency: frequency,
        start_time: block.start_time,
        end_time: block.end_time,
        location: block.location,
        description: block.description,
        block_type: block.block_type
      });
    });
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Date once for whole schedule */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {errors.date && <p className="error-text">{errors.date}</p>}

      <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="none">One-time</option>
        <option value="weekly">Weekly</option>
        <option value="biweekly">Every other week</option>
        <option value="monthly">Monthly</option>
      </select>
      {errors.frequency && <p className="error-text">{errors.frequency}</p>}

      {blocks.map((block, index) => (
        <div key={index} className="time-block-section">

          <input
            placeholder="location"
            value={block.location}
            onChange={(e) =>
              updateBlock(index, "location", e.target.value)
            }
          />
          {errors.blocks?.[index]?.location && (
            <p className="error-text">{errors.blocks[index].location}</p>
          )}

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
          {errors.blocks?.[index]?.block_type && (
            <p className="error-text">{errors.blocks[index].block_type}</p>
          )}

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

              <input
                  type="time"
                  value={block.start_time}
                  onChange={(e) =>
                    updateBlock(index, "start_time", e.target.value)
                  }
                />
                {errors.blocks?.[index]?.start_time && (
                    <p className="error-text">{errors.blocks[index].start_time}</p>
                )}

              <input
                  type="time"
                  value={block.end_time}
                  onChange={(e) =>
                    updateBlock(index, "end_time", e.target.value)
                  }
              />
              {errors.blocks?.[index]?.end_time && (
                    <p className="error-text">{errors.blocks[index].end_time}</p>
              )}

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
              {errors.blocks?.[index]?.duration && (
                    <p className="error-text">{errors.blocks[index].duration}</p>
              )}

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
               {errors.blocks?.[index]?.time_of_day && (
                    <p className="error-text">{errors.blocks[index].time_of_day}</p>
               )}
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
      <button className="btn btn-secondary btn" cltype="button" onClick={addBlock}>
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


