import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import Navbar from "../../components/Navbar.jsx";
import TaskGroup from "./TaskGroup.jsx";
import AddTaskButton from "../../components/AddTaskButton.jsx";
import NotesSection from "./NotesSection.jsx";
import useTimeBlocks from "../../utils/useTimeBlocks.js";
import handleExportCsv from "../../utils/handleExportCsv.js";
import handleExportIcs from "../../utils/handleExportIcs.js";
import useTasksByDateGroup from "../../utils/useTasksByDateGroup.js";
import "./stylesheets/Dashboard.css";


/**
 * Dashboard component - main page displayed after successful login.
 * Displays tasks grouped by day sections (overdue, today, tomorrow, next 7 days) alongside a notes section.
 * @returns {JSX.Element} The dashboard page
 */
function Dashboard() {
    const nav = useNavigate();
    const [message, setMessage] = useState("Loading...");
    const [error, setError] = useState("");

    const { blocks } = useTimeBlocks();

    const {
        overdueTasks, setOverdueTasks,
        todayTasks, setTodayTasks,
        tomorrowTasks, setTomorrowTasks,
        weekTasks, setWeekTasks,
        beyondWeekTasks, setBeyondWeekTasks,
        totalTasks
    } = useTasksByDateGroup(blocks);

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

    if (error) return <p>{error}</p>;

    return (
        <>
            <Navbar/>
            <div className="dashboard-content">
                <div className="task-section">
                    <h1>{message}</h1>

                    <div className="dashboard-header-actions">
                        <AddTaskButton />

                        <div className="export-buttons">
                            <button
                                type="button"
                                className="export-csv-button"
                                onClick={() => handleExportCsv(setError)}
                            >
                                Export CSV
                            </button>

                            <button
                                type="button"
                                className="export-csv-button"
                                onClick={() => handleExportIcs(setError)}
                            >
                                Export ICS
                            </button>
                        </div>
                    </div>
                    {totalTasks === 0 && (
                        <p className="no-tasks-message">🎉 Congrats, you have no tasks!</p>
                    )}
                    <TaskGroup title="Overdue" tasks={overdueTasks} setTasks={setOverdueTasks} overdue={true}/>
                    <TaskGroup title="Today" tasks={todayTasks} setTasks={setTodayTasks}/>
                    <TaskGroup title="Tomorrow" tasks={tomorrowTasks} setTasks={setTomorrowTasks}/>
                    <TaskGroup title="Next 7 Days" tasks={weekTasks} setTasks={setWeekTasks}/>
                    <TaskGroup title="After Next 7 Days" tasks={beyondWeekTasks} setTasks={setBeyondWeekTasks}/>
                </div>
                <NotesSection/>
            </div>
        </>
    );
}

export default Dashboard;
