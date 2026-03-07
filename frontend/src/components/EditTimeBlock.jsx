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
      console.log("GET response:", res.data);
      const data = res.data;
      setInitialData({
        id: data.id,
        date: data.date || "",   // ← ADD THIS
        name: data.name,
        location: data.location,
        block_type: data.block_type,
        description: data.description,
        is_fixed: data.is_fixed,
        duration: data.duration || "",
        time_of_day: data.time_of_day_preference || "",
        start_time: data.start_time || "",
        end_time: data.end_time || "",
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