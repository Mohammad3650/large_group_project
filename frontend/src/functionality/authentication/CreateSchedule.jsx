import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import TimeBlockForm from "../../components/timeBlockForm";


function CreateSchedule() {

    const navigate = useNavigate();
    const [serverErrors, setServerErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleCreate(dataList) {

        if (loading) return;

        setServerErrors([]);
        setLoading(true);

        const errors = [];
        let allSuccess = true;

        for (const data of dataList) {
            try {
                await api.post("/api/time-blocks/", data);
                errors.push({});
            } catch (err) {
                errors.push(err.response?.data || {});
                allSuccess = false;
            }
        }

        setServerErrors(errors);
        setLoading(false);

        if (allSuccess) navigate("/successful-timeblock");
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
                    clearErrors={() => setServerErrors([])}
                />
            </div>
        </div>
    );
}

export default CreateSchedule;
