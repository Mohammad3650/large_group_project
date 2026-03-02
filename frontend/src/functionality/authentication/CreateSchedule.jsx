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
        let createdBlockId = null;

        for (const data of dataList) {
            // ensure previousely allowed to be "" for start_time and end_time are now null for error handling
            const cleanedData = {
                ...data,
                start_time: data.start_time === "" ? null : data.start_time,
                end_time: data.end_time === "" ? null : data.end_time,
            };

            try {
                const res = await api.post("/api/time-blocks/", cleanedData);
                errors.push({});
                if (!createdBlockId) createdBlockId = res.data.id;
            } catch (err) {
                console.log("ERROR RESPONSE:", err.response?.data);
                errors.push(err.response?.data || {});
                allSuccess = false;
            }
        }

        setServerErrors(errors);
        setLoading(false);

        if (allSuccess) navigate("/successful-timeblock", { state: { id: createdBlockId } });
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
