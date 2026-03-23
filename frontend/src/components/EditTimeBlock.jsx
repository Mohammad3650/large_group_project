import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import TimeBlockForm from "./TimeBlockForm";

function EditTimeBlock() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);

  const [serverErrors, setServerErrors] = useState([]);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
  api.get(`/api/timeblocks/${id}/edit`)
    .then(res => {
        const data = res.data;
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Convert UTC times to local time for display in the form
        const start = Temporal.ZonedDateTime.from(
            `${data.date}T${data.start_time.slice(0, 5)}[UTC]`
        ).withTimeZone(userTimezone);
        const end = Temporal.ZonedDateTime.from(
            `${data.date}T${data.end_time.slice(0, 5)}[UTC]`
        ).withTimeZone(userTimezone);

        const localDate = start.toPlainDate().toString();
        const startTime = `${String(start.hour).padStart(2, "0")}:${String(start.minute).padStart(2, "0")}`;
        const endTime = `${String(end.hour).padStart(2, "0")}:${String(end.minute).padStart(2, "0")}`;
      setInitialData({
        id: data.id,
        date: localDate,
        name: data.name,
        location: data.location,
        block_type: data.block_type,
        description: data.description,
        //is_fixed: data.is_fixed,
        //duration: data.duration || "",
        //time_of_day: data.time_of_day_preference || "",
        start_time: startTime,
        end_time: endTime,
      });
    })
    .catch(err => console.error(err));
}, [id]);

  const navigate = useNavigate();

  async function handleUpdate(dataList) {

      if (loading) return;

      setServerErrors([]);
      setLoading(true);

      const block = dataList[0];

      const cleanedData = {
        ...block,
        start_time: block.start_time === "" ? null : block.start_time,
        end_time: block.end_time === "" ? null : block.end_time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      try {
        await api.patch(`/api/timeblocks/${id}/edit`, cleanedData);

        // redirect after success
        navigate("/successful-timeblock", { state: { id: id } });

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
                loading={false}
                serverErrors={serverErrors}
                clearErrors={() => setServerErrors([])}
            />
        </div>
    </div>
  );

}

export default EditTimeBlock;