import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import LogoutButton from "../../components/logoutButton";
import NavBar from "../LandingPage/NavBar.jsx";
import TaskGroup from "./TaskGroup.jsx";
import AddTaskButton from "../../components/AddTaskButton.jsx";
import NotesSection from "./NotesSection.jsx";
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

    const [overdueTasks, setOverdueTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [tomorrowTasks, setTomorrowTasks] = useState([]);
    const [weekTasks, setWeekTasks] = useState([]);

    const [notes, setNotes] = useState("");
    const [saveStatus, setSaveStatus] = useState(""); // "saving", "saved", ""

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

    useEffect(() => {
        async function fetchTimeBlocks() {
            try {
                const res = await api.get("/api/time-blocks/get/");
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const weekEnd = new Date(today);
                weekEnd.setDate(today.getDate() + 7);

                const blocks = res.data.map(block => ({
                    id: block.id,
                    name: block.description || block.block_type,
                    datetime: `${block.date}T${block.start_time || "00:00"}`
                }));

                setOverdueTasks(blocks.filter(b => new Date(b.datetime) < today).sort(sortTasksByDate));

                setTodayTasks(blocks.filter(b => {
                    const d = new Date(b.datetime);
                    return d >= today && d < tomorrow;
                }).sort(sortTasksByDate));

                setTomorrowTasks(blocks.filter(b => {
                    const d = new Date(b.datetime);
                    return d >= tomorrow && d < new Date(tomorrow.getTime() + 86400000);
                }).sort(sortTasksByDate));

                setWeekTasks(blocks.filter(b => {
                    const d = new Date(b.datetime);
                    return d >= new Date(tomorrow.getTime() + 86400000) && d <= weekEnd;
                }).sort(sortTasksByDate));

            } catch (err) {
                if (err?.response?.status === 401) {
                    nav("/login");
                } else {
                    setError("Failed to load tasks");
                }
            }
        }
        fetchTimeBlocks();
    }, []);

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
                        <p className="no-tasks-message">🎉 Congrats, you have no tasks for the next week!</p>
                    )}
                    <TaskGroup title="Overdue" tasks={overdueTasks} setTasks={setOverdueTasks} overdue={true}/>
                    <TaskGroup title="Today" tasks={todayTasks} setTasks={setTodayTasks}/>
                    <TaskGroup title="Tomorrow" tasks={tomorrowTasks} setTasks={setTomorrowTasks}/>
                    <TaskGroup title="Next 7 Days" tasks={weekTasks} setTasks={setWeekTasks}/>
                    <div className="bottom-buttons">
                        <LogoutButton/>
                    </div>
                </div>
                <NotesSection/>
            </div>
        </>
    );
}

export default Dashboard;
