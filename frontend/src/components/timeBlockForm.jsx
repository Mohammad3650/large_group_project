import { useState } from "react";

function TimeBlockForm({ onSubmit, loading }) {

    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [blockType, setBlockType] = useState("study");
    

    function handleSubmit(e) {
        e.preventDefault();

        onSubmit({
            date,
            start_time: startTime,
            end_time: endTime,
            location,
            block_type: blockType
        });

        setStartTime("");
        setEndTime("");
        setLocation("");
    }

    return (
        <form onSubmit={handleSubmit}>

            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
            />

            <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
            />

            <input
                placeholder="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />

            <select
                value={blockType}
                onChange={(e) => setBlockType(e.target.value)}
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

            <button disabled={loading}>
                {loading ? "Saving..." : "Create"}
            </button>
        </form>
    );
}

export default TimeBlockForm;
