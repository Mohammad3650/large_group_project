import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import LogoutButton from "../../components/logoutButton";
import NavBar from "../LandingPage/NavBar.jsx";
import TaskGroup from "./TaskGroup.jsx";
import AddTaskButton from "../../components/AddTaskButton.jsx";
import "./Dashboard.css";

/**
 * Sorts tasks in ascending order by datetime.
 * @param {Object} a - First task object
 * @param {Object} b - Second task object
 * @returns {number} Negative if a comes first, positive if b comes first
 */
const sortTasksByDate = (a, b) => new Date(a.datetime) - new Date(b.datetime);


/**
 * Dashboard component - main page displayed after successful login.
 * Displays tasks grouped by day sections (overdue, today, tomorrow, next 7 days) alongside a notes section.
 * @returns {JSX.Element} The dashboard page
 */
function Dashboard() {
    const nav = useNavigate();
    const [message, setMessage] = useState("Loading...");
    const [error, setError] = useState("");

    const [overdueTasks, setOverdueTasks] = useState([
        { id: 1, name: "Go gym", datetime: "2026-02-16T20:00" },
        { id: 2, name: "Go to SGT", datetime: "2026-02-17T14:00" },
    ].sort(sortTasksByDate));

    const [todayTasks, setTodayTasks] = useState([
        { id: 1, name: "Go for a run", datetime: "2026-02-19T09:00" },
        { id: 2, name: "Go shopping", datetime: "2026-02-19T17:00" },
    ].sort(sortTasksByDate));

    const [tomorrowTasks, setTomorrowTasks] = useState([
        { id: 1, name: "Lecture", datetime: "2026-02-20T10:00" }
    ].sort(sortTasksByDate));

    const [weekTasks, setWeekTasks] = useState([
        { id: 1, name: "Lab", datetime: "2026-02-24T14:00" }
    ].sort(sortTasksByDate));

    useEffect(() => {
        document.body.classList.add("dashboard-page");

        const handleResize = () => window.scrollTo(0, 0);
        window.addEventListener("resize", handleResize);

        return () => {
            document.body.classList.remove("dashboard-page");
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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

    const totalTasks = overdueTasks.length + todayTasks.length + tomorrowTasks.length + weekTasks.length;

    if (error) return <p>{error}</p>;

    return (
        <>
            <NavBar/>
            <div className="dashboard-content">
                <div className="task-section">
                    <h1>{message}</h1>
                    <AddTaskButton/>
                    {totalTasks === 0 && (
                        <p className="no-tasks-message">🎉 Congrats, you have no tasks!</p>
                    )}
                    <TaskGroup title="Overdue" tasks={overdueTasks} setTasks={setOverdueTasks} overdue={true}/>
                    <TaskGroup title="Today" tasks={todayTasks} setTasks={setTodayTasks}/>
                    <TaskGroup title="Tomorrow" tasks={tomorrowTasks} setTasks={setTomorrowTasks}/>
                    <TaskGroup title="Next 7 Days" tasks={weekTasks} setTasks={setWeekTasks}/>
                    <div className="bottom-buttons">
                        <LogoutButton/>
                    </div>
                </div>
                <div className="notes-section">
                    <textarea placeholder="Notes"></textarea>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
