import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import LogoutButton from "../../components/logoutButton";
import NavBar from "../LandingPage/NavBar.jsx";
import SideBar from "./SideBar.jsx";
import Task from "./Task.jsx";
import "./Dashboard.css";

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

  useEffect(() => {
    document.body.classList.add("dashboard-page");
    return () => document.body.classList.remove("dashboard-page");
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  const [todayTasks, setTodayTasks] = useState([
    { id: 1, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 2, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 3, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 4, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 5, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 6, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 7, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 8, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 9, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 10, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 11, name: "Go for a run", datetime: "2026-02-19T09:00" },
    { id: 12, name: "Go shopping", datetime: "2026-02-19T16:00" }
  ].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)));

  const [tomorrowTasks, setTomorrowTasks] = useState([
    { id: 1, name: "LectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLectureLecture", datetime: "2026-02-20T10:00" }
  ]);

  const [weekTasks, setWeekTasks] = useState([
    { id: 1, name: "Lab", datetime: "2026-02-24T14:00" }
  ]);

  const [todayOpen, setTodayOpen] = useState(true);
  const [tomorrowOpen, setTomorrowOpen] = useState(true);
  const [weekOpen, setWeekOpen] = useState(true);

  function handleDeleteToday(id) {
    setTodayTasks(todayTasks.filter(task => task.id !== id));
  }

  function handleDeleteTomorrow(id) {
    setTomorrowTasks(tomorrowTasks.filter(task => task.id !== id));
  }

  function handleDeleteRestOfWeek(id) {
    setWeekTasks(weekTasks.filter(task => task.id !== id));
  }

  return (
      <>
        <NavBar/>
        <div className="dashboard-page">
          <div className="dashboard-content">
            <div className="task-section">
              <h1 className="title-message">{message}</h1>
              <button className="add-task-btn">+ Add Task</button>
              <div className={"day-section"} onClick={() => setTodayOpen(!todayOpen)}>
                <span className={`arrow ${todayOpen ? "open" : "closed"}`}>^</span>
                <h5>Today</h5>
                <h5 className={"number-of-tasks"}>({todayTasks.length})</h5>
              </div>
              {todayOpen && todayTasks.map(task => (
                <Task key={task.id} name={task.name} datetime={task.datetime}
                      onDelete={() => handleDeleteToday(task.id)} />
              ))}

              <div className={"day-section"} onClick={() => setTomorrowOpen(!tomorrowOpen)}>
                <span className={`arrow ${tomorrowOpen ? "open" : "closed"}`}>^</span>
                <h5>Tomorrow</h5>
                <h5 className={"number-of-tasks"}>({tomorrowTasks.length})</h5>
              </div>
              {tomorrowOpen && tomorrowTasks.map(task => (
                <Task key={task.id} name={task.name} datetime={task.datetime}
                      onDelete={() => handleDeleteTomorrow(task.id)} />
              ))}

              <div className={"day-section"} onClick={() => setWeekOpen(!weekOpen)}>
                <span className={`arrow ${weekOpen ? "open" : "closed"}`}>^</span>
                <h5>Next 7 Days</h5>
                <h5 className={"number-of-tasks"}>({weekTasks.length})</h5>
              </div>
              {weekOpen && weekTasks.map(task => (
                <Task key={task.id} name={task.name} datetime={task.datetime}
                      onDelete={() => handleDeleteRestOfWeek(task.id)} />
              ))}
              <br/>
              <div className="logout-bottom">
                <LogoutButton />
              </div>
            </div>

            <div className="notes-section">
              <textarea placeholder="Notes"></textarea>
            </div>
          </div>
        </div>
      </>
  );
}

export default Dashboard;
