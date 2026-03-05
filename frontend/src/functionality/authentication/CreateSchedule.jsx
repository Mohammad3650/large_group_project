import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import TimeBlockForm from "../../components/timeBlockForm";
import GeneratorForm from "../../components/generatorForm";
import NavBar from "../LandingPage/NavBar";

const TABS = [
  { id: "timeblock", label: "Time Block" },
  { id: "generate", label: "Generate" },
];


function CreateSchedule() {

    const navigate = useNavigate();
    const [serverErrors, setServerErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("timeblock");

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


    async function handleGenerate(data){
        // TODO: If server response is successful but 'No feasible solution', display error on this page, do not navigate.
        
        if (loading) return;
        
        setServerErrors([]);
        setLoading(true);

        const errors = [];
        let allSuccess = true;
        let response = null;

        try {
            response = await api.post("/schedule/generates/", data);
            errors.push({});
        } catch (err) {
            console.log("ERROR RESPONSE:", err.response?.data);
            errors.push(err.response?.data || {});
            allSuccess = false;
        } finally {
            setServerErrors(errors);
            setLoading(false);
        }
        console.log(response)

        // if (allSuccess) navigate("/preview-schedule", { state: { data: response } });

    }

    return (
    <div>
      <NavBar />
      <div className="page-center">
        <div className="time-block-form-card">
          <h2>Create Schedule</h2>

          {/* Tab Bar */}
          <div className="tab-bar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "tab-btn--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {success && <p>{success}</p>}

          {activeTab === "timeblock" && (
            <TimeBlockForm
              onSubmit={handleCreate}
              loading={loading}
              serverErrors={serverErrors}
              clearErrors={() => setServerErrors([])}
            />
          )}

          {activeTab === "generate" && (
            <div className="tab-panel">
              <GeneratorForm
                onSubmit={handleGenerate}
                loading={loading}
                serverErrors={serverErrors}
                clearErrors={() => setServerErrors([])}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateSchedule;
