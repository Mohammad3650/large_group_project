import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import TimeBlockForm from "../../components/timeBlockForm";


function CreateSchedule() {

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleCreate(data) {

        if (loading) return;

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await api.post("/api/time-blocks/", data);
            navigate("/successful-timeblock");
            return;
        } catch (err) {
            setError("Failed to create time block");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-center">
            <div className="time-block-form-card">
                <h2>Create Time Block</h2>

                {error && <p>{error}</p>}
                {success && <p>{success}</p>}

                <TimeBlockForm 
                    onSubmit={handleCreate}
                    loading={loading}
                />
            </div>
        </div>
    );
}

export default CreateSchedule;
