import { useState, useMemo } from 'react';
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
 * Filters a list of tasks by a search term, case-insensitively and ignoring leading/trailing whitespace.
 *
 * @param {Array} tasks - The list of tasks to filter
 * @param {string} searchTerm - The search term to filter by
 * @returns {Array} The filtered list of tasks
 */
function filterTasks(tasks, searchTerm) {
    const cleanedSearchTerm = searchTerm.trim().toLowerCase();
    if (!cleanedSearchTerm) return tasks;
    return tasks.filter((task) =>
        task.name.toLowerCase().includes(cleanedSearchTerm)
    );
}

/**
 * Dashboard component - main page displayed after successful login.
 * Displays tasks grouped by day sections (overdue, today, tomorrow, next 7 days) alongside a notes section.
 *
 * @returns {JSX.Element} The dashboard page
 */
function Dashboard() {
    const [error, setError] = useState('');
    const [showSubscriptions, setShowSubscriptions] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const { message } = useDashboard(setError);
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

    const onImport = (payload) => handleImportSubscription(payload, context);
    const onRefresh = (id) => handleRefreshSubscription(id, context);
    const onDelete = (id) => handleDeleteSubscription(id, context);

    const filteredOverdue = useMemo(() => filterTasks(overdueTasks, searchTerm), [overdueTasks, searchTerm]);
    const filteredToday = useMemo(() => filterTasks(todayTasks, searchTerm), [todayTasks, searchTerm]);
    const filteredTomorrow = useMemo(() => filterTasks(tomorrowTasks, searchTerm), [tomorrowTasks, searchTerm]);
    const filteredWeek = useMemo(() => filterTasks(weekTasks, searchTerm), [weekTasks, searchTerm]);
    const filteredBeyondWeek = useMemo(() => filterTasks(beyondWeekTasks, searchTerm), [beyondWeekTasks, searchTerm]);

    if (blocksError) {
        return <p>{blocksError}</p>;
    }

    return (
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

                <input
                    type="text"
                    className="task-search-input"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div
                    className="day-section"
                    onClick={() => setShowSubscriptions((prev) => !prev)}
                >
                    <span className={`arrow ${showSubscriptions ? 'open' : 'closed'}`}>
                        ^
                    </span>
                    <h5>Timetable Subscriptions</h5>
                </div>

                {showSubscriptions && (
                    <div className="subscription-section">
                        {error && (
                            <p className="subscription-error">{error}</p>
                        )}
                        <SubscriptionForm onImport={onImport} />
                        <SubscriptionList
                            subscriptions={subscriptions}
                            onRefresh={onRefresh}
                            onDelete={onDelete}
                        />
                    </div>
                )}

                {totalTasks === 0 && (
                    <p className="no-tasks-message">
                        🎉 Congrats, you have no tasks!
                    </p>
                )}

                {totalTasks > 0 &&
                    filteredOverdue.length === 0 &&
                    filteredToday.length === 0 &&
                    filteredTomorrow.length === 0 &&
                    filteredWeek.length === 0 &&
                    filteredBeyondWeek.length === 0 &&
                    searchTerm.trim() !== '' && (
                        <p className="no-tasks-message">
                            No tasks found matching "{searchTerm.trim()}"
                        </p>
                    )}

                <TaskGroup title="Overdue" tasks={filteredOverdue} setTasks={setOverdueTasks} overdue={true} />
                <TaskGroup title="Today" tasks={filteredToday} setTasks={setTodayTasks} />
                <TaskGroup title="Tomorrow" tasks={filteredTomorrow} setTasks={setTomorrowTasks} />
                <TaskGroup title="Next 7 Days" tasks={filteredWeek} setTasks={setWeekTasks} />
                <TaskGroup title="After Next 7 Days" tasks={filteredBeyondWeek} setTasks={setBeyondWeekTasks} />
            </div>
            <NotesSection />
        </div>
    );
}

export default Dashboard;