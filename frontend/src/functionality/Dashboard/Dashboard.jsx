import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import Navbar from "../../components/Navbar.jsx";
import TaskGroup from "./TaskGroup.jsx";
import AddTaskButton from "../../components/AddTaskButton.jsx";
import NotesSection from "./NotesSection.jsx";
import useTimeBlocks from "../../utils/useTimeBlocks.js";
import "./stylesheets/Dashboard.css";
import handleExportCsv from "../../utils/handleExportCsv.js";
import SubscriptionForm from "./SubscriptionForm.jsx";
import SubscriptionList from "./SubscriptionList.jsx";
import createCalendarSubscription from "../../utils/createCalendarSubscription.js";
import deleteCalendarSubscription from "../../utils/deleteCalendarSubscription.js";
import getCalendarSubscriptions from "../../utils/getCalendarSubscriptions.js";
import handleExportIcs from "../../utils/handleExportIcs.js";
import refreshCalendarSubscription from "../../utils/refreshCalendarSubscription.js";


/**
 * Converts a task object's date and start_time into a Date object for comparison.
 * @param {Object} b - Task object with date and start_time fields
 * @returns {Date} Combined date and time as a Date object
 */
const getDate = (b) => new Date(`${b.date}T${b.startTime}`);

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
    const [subscriptions, setSubscriptions] = useState([]);

    const [overdueTasks, setOverdueTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [tomorrowTasks, setTomorrowTasks] = useState([]);
    const [weekTasks, setWeekTasks] = useState([]);
    const [beyondWeekTasks, setBeyondWeekTasks] = useState([]);

    const { blocks, refetchBlocks, error: blocksError, } = useTimeBlocks();

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
                const response = await api.get("/dashboard/");
                setMessage(response.data.message);
            } catch (err) {
                if (err?.response?.status === 401) {
                    nav("/login");
                } else {
                    setError("Failed to load dashboard");
                }
            }
        }

        fetchDashboard();
    }, [nav]);

    useEffect(() => {
        async function fetchSubscriptions() {
            try {
                const data = await getCalendarSubscriptions();
                setSubscriptions(data);
            } catch {
                setError("Failed to load calendar subscriptions");
            }
        }

        fetchSubscriptions();
    }, []);

    useEffect(() => {
        if (blocks === null) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);

        setOverdueTasks(blocks.filter(b => getDate(b) < today).sort(sortTasksByDate));
        setTodayTasks(blocks.filter(b => getDate(b) >= today && getDate(b) < tomorrow).sort(sortTasksByDate));
        setTomorrowTasks(blocks.filter(b => getDate(b) >= tomorrow && getDate(b) < dayAfterTomorrow).sort(sortTasksByDate));
        setWeekTasks(blocks.filter(b => getDate(b) >= dayAfterTomorrow && getDate(b) <= weekEnd).sort(sortTasksByDate));
        setBeyondWeekTasks(blocks.filter(b => getDate(b) > weekEnd).sort(sortTasksByDate));
    }, [blocks]);

    async function handleImportSubscription(payload) {
        try {
            setError("");
            const responseData = await createCalendarSubscription(payload);
            setSubscriptions((currentSubscriptions) => [
                responseData.subscription,
                ...currentSubscriptions,
            ]);
            await refetchBlocks();
        } catch (requestError) {
            const detail =
                requestError?.response?.data?.source_url?.[0] ||
                requestError?.response?.data?.name?.[0] ||
                requestError?.response?.data?.message ||
                "Failed to import timetable";
            setError(detail);
        }
    }

    async function handleRefreshSubscription(subscriptionId) {
        try {
            setError("");
            const responseData = await refreshCalendarSubscription(subscriptionId);

            setSubscriptions((currentSubscriptions) =>
                currentSubscriptions.map((subscription) =>
                    subscription.id === subscriptionId
                        ? responseData.subscription
                        : subscription,
                ),
            );

            await refetchBlocks();
        } catch {
            setError("Failed to refresh timetable subscription");
        }
    }

    async function handleDeleteSubscription(subscriptionId) {
        try {
            setError("");
            await deleteCalendarSubscription(subscriptionId);

            setSubscriptions((currentSubscriptions) =>
                currentSubscriptions.filter(
                    (subscription) => subscription.id !== subscriptionId,
                ),
            );
        } catch {
            setError("Failed to delete timetable subscription");
        }
    }

    const totalTasks = overdueTasks.length + todayTasks.length + tomorrowTasks.length + weekTasks.length + beyondWeekTasks.length;

    if (error || blocksError) {
    return <p>{error || blocksError}</p>;
    }

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

                    <div className="subscription-section">
                        <SubscriptionForm onImport={handleImportSubscription} />
                        <SubscriptionList
                            subscriptions={subscriptions}
                            onRefresh={handleRefreshSubscription}
                            onDelete={handleDeleteSubscription}
                        />
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
