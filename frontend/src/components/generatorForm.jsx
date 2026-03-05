import { useState, useEffect } from "react";
import "./timeBlockFormStyle.css";

function GeneratorForm({ onSubmit, loading, serverErrors, clearErrors }) {

    const [week_start, setWeekStart] = useState("");
    const [week_end, setWeekEnd] = useState("");
    const [even_spread, setEvenSpread] = useState(false);
    const [include_scheduled, setIncludeScheduled] = useState(false);
    const [windows, setWindow] = useState({ start_min: "", end_min: "" , daily: true});

    const [blocks, setBlocks] = useState([{
        name: "",
        duration: "",
        frequency: "",
        daily: false,
        start_time_preference: "None",
        location: ""
    }])

    function addBlock() {
        setBlocks([
        ...blocks,
        {
            name: "",
            duration: "",
            frequency: "",
            daily: false,
            start_time_preference: "None",
            location: ""
        }
        ]);
        clearErrors();
    }

    function updateBlock(index, field, value) {
        const updated = [...blocks];
        updated[index][field] = value;
        if (field === "daily") {
            updated[index].frequency = value ? "1" : "";
        }
        setBlocks(updated);
        clearErrors();
    }

    function updateWindow(field, value) {
        setWindow(prev => ({ ...prev, [field]: value }));
    }

    function deleteBlock(indexToDelete) {
        setBlocks(blocks.filter((_, index) => index !== indexToDelete));
        clearErrors();

    }

    function handleEvenSpreadChange(checked) {
        setEvenSpread(checked);
        if (!checked) setIncludeScheduled(false);
    }

    function handleSubmit(e){
        e.preventDefault();
        const k = {
            week_start,
            week_end,
            even_spread,
            include_scheduled,
            windows: [windows],
            unscheduled: blocks
        }
        console.log(k)
        onSubmit(k)
    }

    useEffect(() => {clearErrors()},[] )

    
    return (
        <form onSubmit={handleSubmit}>
            {serverErrors[0]?.date && ( <p className="error-text-date"> {serverErrors[0].date[0]} </p> )}
            {/* Start and end dates */}
            <div className="range-box">
                <label> Start
                <input
                    type="date"
                    value={week_start}
                    onChange={(e) => setWeekStart(e.target.value)}
                />
                </label>
                <label>End
                <input
                    type="date"
                    value={week_end}
                    onChange={(e) => setWeekEnd(e.target.value)}
                />
                </label>
            </div>

            <div className="range-box">
                <label>
                    Wake Up
                    <input
                        type="time"
                        value={windows.start_min}
                        onChange={(e) => updateWindow("start_min", e.target.value)}
                    />
                </label>

                <label>
                    Sleep
                    <input
                        type="time"
                        value={windows.end_min}
                        onChange={(e) => updateWindow("end_min", e.target.value)}
                    />
                </label>
            </div>

            {/* Global options */}
            <div className="global-options">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={even_spread}
                        onChange={(e) => handleEvenSpreadChange(e.target.checked)}
                    />
                    Even Spread
                </label>

                <label className={`checkbox-label ${!even_spread ? "checkbox-label--disabled" : ""}`}>
                    <input
                        type="checkbox"
                        checked={include_scheduled}
                        disabled={!even_spread}
                        onChange={(e) => setIncludeScheduled(e.target.checked)}
                    />
                    Include Scheduled
                </label>
            </div>

            {blocks.map((block, index) => (
                <div key={index} className="time-block-section">
                    {serverErrors[index]?.name && <p className="error-text">{serverErrors[index].name[0]}</p>}
                    <input
                        placeholder="Name"
                        value={block.name}
                        onChange={(e) =>
                        updateBlock(index, "name", e.target.value)
                        }
                    />

                    {serverErrors[index]?.duration && <p className="error-text">{serverErrors[index].duration[0]}</p>}
                    <input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={block.duration}
                        onChange={(e) =>
                            updateBlock(index, "duration", e.target.value)
                        }
                    />

                    {/* Daily checkbox + frequency */}
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={block.daily}
                            onChange={(e) => updateBlock(index, "daily", e.target.checked)}
                        />
                        Daily
                    </label>

                    {serverErrors?.[index]?.frequency && <p className="error-text">{serverErrors[index].frequency[0]}</p>}
                    <input
                        type="number"
                        placeholder="Frequency (times per week)"
                        value={block.frequency}
                        disabled={block.daily}
                        onChange={(e) => updateBlock(index, "frequency", e.target.value)}
                    />

                    {serverErrors[index]?.start_time_preference && <p className="error-text">{serverErrors[index].start_time_preference[0]}</p>}
                    <select
                        value={block.start_time_preference}
                        placeholder="Start time preference"
                        onChange={(e) =>
                            updateBlock(index, "start_time_preference", e.target.value)
                        }
                        >
                        <option value="None">None</option>
                        <option value="Early">Early</option>
                        <option value="Late">Late</option>
                    </select>

                    {serverErrors[index]?.location && <p className="error-text">{serverErrors[index].location[0]}</p>}
                    <input
                        placeholder="Location"
                        value={block.location}
                        onChange={(e) =>
                        updateBlock(index, "location", e.target.value)
                        }
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
                    {loading ?  <> <span className="spinner" /> Generating... </>  : "Create Schedule"}
                </button>
            </div>

        </form>

    )

}
{/* <select
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
                        <option value="extracurricular">Extracurricular</option>
                    </select> */}
export default GeneratorForm