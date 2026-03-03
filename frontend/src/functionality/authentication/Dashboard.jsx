import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import NavBar from "../LandingPage/NavBar.jsx";
import TaskGroup from "./TaskGroup.jsx";
import AddTaskButton from "../../components/AddTaskButton.jsx";
import NotesSection from "./NotesSection.jsx";
import "./Dashboard.css";


/**
 * Converts a task object's date and start_time into a Date object for comparison.
 * @param {Object} b - Task object with date and start_time fields
 * @returns {Date} Combined date and time as a Date object
 */
const getDate = (b) => new Date(`${b.date}T${b.start_time}`);

/**
 * Sorts tasks in ascending order by datetime.
 * @param {Object} a - First task object
 * @param {Object} b - Second task object
 * @returns {number} Negative if a comes first, positive if b comes first
 */
const sortTasksByDate = (a, b) => getDate(a) - getDate(b);


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
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0];

        const hardcodedBlocks = [
            { id: 1, name: "Morning Lecture", date: dateStr, start_time: "09:00", end_time: "10:00" },
            { id: 2, name: "Study Session", date: dateStr, start_time: "11:00", end_time: "13:00" },
            { id: 3, name: "Lab", date: dateStr, start_time: "14:00", end_time: "16:00" },
            { id: 4, name: "Tutorial", date: dateStr, start_time: "10:00", end_time: "11:00" },
            { id: 5, name: "Gym", date: dateStr, start_time: "07:00", end_time: "08:30" },
            { id: 6, name: "Team Meeting", date: dateStr, start_time: "13:00", end_time: "14:00" },
            { id: 7, name: "Office Hours", date: dateStr, start_time: "16:00", end_time: "17:00" },
            { id: 8, name: "Dinner with Friends", date: dateStr, start_time: "18:00", end_time: "20:00" },
            { id: 9, name: "Revision", date: dateStr, start_time: "20:00", end_time: "22:00" },
            { id: 10, name: "Sleep", date: dateStr, start_time: "23:00", end_time: "23:59" },
        ];

        setTodayTasks(hardcodedBlocks);
    }, []);


    useEffect(() => {
        async function fetchTimeBlocks() {
            try {
                const res = await api.get("/api/time-blocks/get/");
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const dayAfterTomorrow = new Date(today);
                dayAfterTomorrow.setDate(today.getDate() + 2);
                const weekEnd = new Date(today);
                weekEnd.setDate(today.getDate() + 7);


                const blocks = res.data.map(block => ({
                    id: block.id,
                    name: block.name,
                    date: block.date,
                    start_time: block.start_time || "00:00",
                    end_time: block.end_time || "23:59",
                }));

                setOverdueTasks(blocks.filter(b => getDate(b) < today).sort(sortTasksByDate));
            //    setTodayTasks(blocks.filter(b => getDate(b) >= today && getDate(b) < tomorrow).sort(sortTasksByDate));
                setTomorrowTasks(blocks.filter(b => getDate(b) >= tomorrow && getDate(b) < dayAfterTomorrow).sort(sortTasksByDate));
                setWeekTasks(blocks.filter(b => getDate(b) >= dayAfterTomorrow && getDate(b) <= weekEnd).sort(sortTasksByDate));

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
                </div>
                <NotesSection/>
            </div>
        </>
    );
}

export default Dashboard;
