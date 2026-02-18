import { useState } from "react";

function TimeBlockForm({ onSubmit, loading }) {

  const [date, setDate] = useState("");

  const [blocks, setBlocks] = useState([
    {
      date: "",
      location: "",
      block_type: "study",
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
        is_fixed: false,
        duration: "",
        time_of_day: "",
        start_time: "",
        end_time: "",
      }
    ]);
  }

  function updateBlock(index, field, value) {
    const updated = [...blocks];
    updated[index][field] = value;
    setBlocks(updated);
  }

  function deleteBlock(indexToDelete) {
  setBlocks(blocks.filter((_, index) => index !== indexToDelete));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      date,
      blocks
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

      {blocks.map((block, index) => (
        <div key={index} style={{ marginBottom: "20px", marginTop: "50px" }}>

          {blocks.length > 1 && (
              <button
                type="button"
                onClick={() => deleteBlock(index)}
                style={{ background: "red", color: "white", marginBottom: "10px" }}
              >
                Delete Event
              </button>
          )}

          <input
            placeholder="location"
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

              <input
                  type="time"
                  value={block.start_time}
                  onChange={(e) =>
                    updateBlock(index, "start_time", e.target.value)
                  }
                />

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


        </div>
      ))}

      <button type="button" onClick={addBlock}>
        Add Another Event
      </button>

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Create Schedule"}
      </button>

    </form>
  );
}

export default TimeBlockForm;


