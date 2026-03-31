import { useState } from 'react';
import TaskGroup from './TaskGroup.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import NotesSection from './NotesSection.jsx';
import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import handleExportCsv from '../../utils/Api/handleExportCsv.js';
import SubscriptionForm from './SubscriptionForm.jsx';
import SubscriptionList from './SubscriptionList.jsx';
import handleExportIcs from '../../utils/Api/handleExportIcs.js';
import useTasksByDateGroup from '../../utils/Hooks/useTasksByDateGroup.js';
import useDashboard from '../../utils/Hooks/useDashboard.js';
import useSubscriptions from '../../utils/Hooks/useSubscriptions.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import useScrollToTopOnResize from '../../utils/Hooks/useScrollToTopOnResize.js';
import useAutoResetError from '../../utils/Hooks/useAutoResetError.js';
import handleImportSubscription from '../../utils/Helpers/handleImportSubscription.js';
import handleRefreshSubscription from '../../utils/Helpers/handleRefreshSubscription.js';
import handleDeleteSubscription from '../../utils/Helpers/handleDeleteSubscription.js';
import './stylesheets/Dashboard.css';

/**
 * Dashboard component - main page displayed after successful login.
 * Displays tasks grouped by day sections (overdue, today, tomorrow, next 7 days) alongside a notes section.
 * @returns {JSX.Element} The dashboard page
 */
function Dashboard() {
    const [showSubscriptions, setShowSubscriptions] = useState(true);

    const { message, error, setError } = useDashboard();
    const { blocks, refetchBlocks, error: blocksError } = useTimeBlocks();
    const { subscriptions, setSubscriptions } = useSubscriptions(setError);

    const {
        overdueTasks, setOverdueTasks,
        todayTasks, setTodayTasks,
        tomorrowTasks, setTomorrowTasks,
        weekTasks, setWeekTasks,
        beyondWeekTasks, setBeyondWeekTasks,
        totalTasks,
    } = useTasksByDateGroup(blocks);

    useBodyClass('dashboard-page');
    useScrollToTopOnResize();
    useAutoResetError(error, setError);

    const context = { setSubscriptions, setError, refetchBlocks };

    if (blocksError) {
        return <p>{blocksError}</p>;
    }

    return (
        <>
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

                    <div
                        className="day-section"
                        onClick={() => setShowSubscriptions((prev) => !prev)}
                    >
                        <span
                            className={`arrow ${showSubscriptions ? 'open' : 'closed'}`}
                        >
                            ^
                        </span>
                        <h5>Timetable subscriptions</h5>
                    </div>

                    {showSubscriptions && (
                        <div className="subscription-section">
                            {error && (
                                <p className="subscription-error">{error}</p>
                            )}

                            <SubscriptionForm
                                onImport={(payload) => handleImportSubscription(payload, context)}
                            />
                            <SubscriptionList
                                subscriptions={subscriptions}
                                onRefresh={(id) => handleRefreshSubscription(id, context)}
                                onDelete={(id) => handleDeleteSubscription(id, context)}
                            />
                        </div>
                    )}

                    {totalTasks === 0 && (
                        <p className="no-tasks-message">
                            🎉 Congrats, you have no tasks!
                        </p>
                    )}

                    <TaskGroup
                        title="Overdue"
                        tasks={overdueTasks}
                        setTasks={setOverdueTasks}
                        overdue={true}
                    />
                    <TaskGroup
                        title="Today"
                        tasks={todayTasks}
                        setTasks={setTodayTasks}
                    />
                    <TaskGroup
                        title="Tomorrow"
                        tasks={tomorrowTasks}
                        setTasks={setTomorrowTasks}
                    />
                    <TaskGroup
                        title="Next 7 Days"
                        tasks={weekTasks}
                        setTasks={setWeekTasks}
                    />
                    <TaskGroup
                        title="After Next 7 Days"
                        tasks={beyondWeekTasks}
                        setTasks={setBeyondWeekTasks}
                    />
                </div>
                <NotesSection />
            </div>
        </>
    );
}

export default Dashboard;