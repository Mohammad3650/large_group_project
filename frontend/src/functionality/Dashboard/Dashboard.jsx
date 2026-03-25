import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import Navbar from "../../components/Navbar.jsx";
import TaskGroup from "./TaskGroup.jsx";
import AddTaskButton from "../../components/AddTaskButton.jsx";
import NotesSection from "./NotesSection.jsx";
import useTimeBlocks from "../../utils/useTimeBlocks.js";
import handleExportCsv from "../../utils/handleExportCsv.js";
import SubscriptionForm from "./SubscriptionForm.jsx";
import SubscriptionList from "./SubscriptionList.jsx";
import createCalendarSubscription from "../../utils/createCalendarSubscription.js";
import deleteCalendarSubscription from "../../utils/deleteCalendarSubscription.js";
import getCalendarSubscriptions from "../../utils/getCalendarSubscriptions.js";
import handleExportIcs from "../../utils/handleExportIcs.js";
import refreshCalendarSubscription from "../../utils/refreshCalendarSubscription.js";
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
    const [subscriptions, setSubscriptions] = useState([]);

    const {
        blocks,
        refetchBlocks,
        error: blocksError,
    } = useTimeBlocks();

    const {
        overdueTasks, setOverdueTasks,
        todayTasks, setTodayTasks,
        tomorrowTasks, setTomorrowTasks,
        weekTasks, setWeekTasks,
        beyondWeekTasks, setBeyondWeekTasks,
        totalTasks
    } = useTasksByDateGroup(blocks);

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
        document.body.classList.add("dashboard-page");
        window.scrollTo(0, 0);

        const handleResize = () => window.scrollTo(0, 0);
        window.addEventListener("resize", handleResize);

        return () => {
            document.body.classList.remove("dashboard-page");
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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
                        <div className="dashboard-add-task">
                            <AddTaskButton />
                        </div>

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
                <div className="right-column">
                    <NotesSection />
                    <div className="subscription-section">
                        <SubscriptionForm onImport={handleImportSubscription} />
                        <SubscriptionList
                            subscriptions={subscriptions}
                            onRefresh={handleRefreshSubscription}
                            onDelete={handleDeleteSubscription}
                        />
                    </div>
                </div>

            </div>
        </>
    );
}

export default Dashboard;
