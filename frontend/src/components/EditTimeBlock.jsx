import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import TimeBlockForm from "./TimeBlockForm";

function EditTimeBlock() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);

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

  function handleUpdate(dataList) {
    api.patch(`/api/timeblocks/${id}/edit`, dataList[0])
      .then(res => {
        alert("Time block updated successfully!")
      })
      .catch(err => console.error(err));
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
                serverErrors={[]}
                clearErrors={() => {}}
            />
        </div>
    </div>
  );

}

export default EditTimeBlock;