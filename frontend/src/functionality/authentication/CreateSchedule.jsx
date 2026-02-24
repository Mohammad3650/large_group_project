import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import TimeBlockForm from "../../components/timeBlockForm";


function CreateSchedule() {

    const navigate = useNavigate();
    const [serverErrors, setServerErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleCreate(data) {

        if (loading) return;

        setServerErrors({});
        setSuccess("");
        setLoading(true);

        try {
            await api.post("/api/time-blocks/", data);
            navigate("/successful-timeblock");
            return;
        } catch (err) {
            setServerErrors(err.response?.data || {});  //if no errors just have default of nothing
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-center">
            <div className="time-block-form-card">
                <h2>Create Time Block</h2>
                {success && <p>{success}</p>}

                <TimeBlockForm 
                    onSubmit={handleCreate}
                    loading={loading}
                    serverErrors={serverErrors}
                />
            </div>
        </div>
    );
}

export default CreateSchedule;
