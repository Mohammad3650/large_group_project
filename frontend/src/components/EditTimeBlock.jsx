import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import TimeBlockForm from "./TimeBlockForm";
import toLocalDateTime from "../utils/toLocalDateTime.js";
import getUserTimezone from "../utils/getUserTimezone.js";

/**
 * Component for editing an existing time block.
 *
 * Fetches the time block data by ID from the URL, converts it to the user's
 * local date/time, and pre-fills the form. On submission, it updates the
 * time block via the API and redirects to a success page.
 *
 * @returns {JSX.Element} A form populated with the existing time block data,
 * or a loading message while data is being fetched.
 */

function EditTimeBlock() {
    const { id } = useParams();
    const [initialData, setInitialData] = useState(null);

    const [serverErrors, setServerErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get(`/api/timeblocks/${id}/edit`)
        .then(res => {
            const data = res.data;
            const { localDate, localTime: startTime } = toLocalDateTime(data.date, data.start_time);
            const { localTime: endTime } = toLocalDateTime(data.date, data.end_time);

            setInitialData({
            id: data.id,
            date: localDate,
            name: data.name,
            location: data.location,
            block_type: data.block_type,
            description: data.description,
            start_time: startTime,
            end_time: endTime,
            });
        })
        .catch(err => console.error(err));
    }, [id]);

    const nav = useNavigate();

    async function handleUpdate(dataList) {

        if (loading) return;

        setServerErrors([]);
        setLoading(true);

        const block = dataList[0];

        const cleanedData = {
        ...block,
        start_time: block.start_time === "" ? null : block.start_time,
        end_time: block.end_time === "" ? null : block.end_time,
        timezone: getUserTimezone(),
        };

        try {
        await api.patch(`/api/timeblocks/${id}/edit`, cleanedData);

        // redirect after success
        nav("/successful-timeblock", { state: { id: id } });

        } catch (err) {
        console.log("UPDATE ERROR:", err.response?.data);
        setServerErrors([err.response?.data || {}]);
        }

        setLoading(false);
    }

    if (!initialData) return <p>Loading...</p>;

    return (
    <div className="page-center">
        <div className="time-block-form-card">
            <h2>Edit Time Block</h2>
            <TimeBlockForm
                onSubmit={handleUpdate}
                initialData={initialData}
                loading={loading}
                serverErrors={serverErrors}
                clearErrors={() => setServerErrors([])}
            />
        </div>
    </div>
    );

}

export default EditTimeBlock;