import { useState } from "react";
import "../timeBlockFormStyle.css";

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
        <div key={index} className="time-block-section">

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
    <div className="time-block-form-btn">
      <button className="btn btn-secondary" cltype="button" onClick={addBlock}>
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

    
//
//     function handleSubmit(e) {
//         e.preventDefault();
//
//         onSubmit({
//             date,
//             start_time: startTime,
//             end_time: endTime,
//             location,
//             block_type: blockType
//         });
//
//         setStartTime("");
//         setEndTime("");
//         setLocation("");
//     }
//
//     return (
//         <form onSubmit={handleSubmit}>
//
//             <input
//                 type="date"
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//             />
//
//             <input
//                 type="time"
//                 value={startTime}
//                 onChange={(e) => setStartTime(e.target.value)}
//             />
//
//             <input
//                 type="time"
//                 value={endTime}
//                 onChange={(e) => setEndTime(e.target.value)}
//             />
//
//             <input
//                 placeholder="location"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//             />
//
//             <select
//                 value={blockType}
//                 onChange={(e) => setBlockType(e.target.value)}
//             >
//                 <option value="sleep">Sleep</option>
//                 <option value="study">Study</option>
//                 <option value="lecture">Lecture</option>
//                 <option value="lab">Lab</option>
//                 <option value="tutorial">Tutorial</option>
//                 <option value="commute">Commute</option>
//                 <option value="exercise">Exercise</option>
//                 <option value="break">Break</option>
//                 <option value="work">Work</option>
//                 <option value="extracurricular">Extracurricular</option>
//             </select>
//
//             <button disabled={loading}>
//                 {loading ? "Saving..." : "Create"}
//             </button>
//         </form>
//     );
// }
