import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import LogoutButton from "../../components/logoutButton";
import CreateScheduleButton from "../../components/CreateScheduleButton";

function Dashboard() {
  const nav = useNavigate();
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get("/dashboard/");
        setMessage(res.data.message);
      } catch (err) {
        if (err?.response?.status === 401) {
          nav("/login"); // token missing / expired
        } else {
          setError("Failed to load dashboard");
        }
      }
    }

    fetchDashboard();
  }, [nav]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <div>
        <h1>{message}</h1>
      </div>

      <LogoutButton />
      <CreateScheduleButton/>
    </>
  );
}

export default Dashboard;
