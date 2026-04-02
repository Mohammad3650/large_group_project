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
import completeTimeBlock from '../../utils/Api/completeTimeBlock.js';
import undoCompleteTimeBlock from '../../utils/Api/undoCompleteTimeBlock.js';
import filterTasksForSearch from '../../utils/Helpers/filterTasksForSearch.js';
import getDateBoundaries from '../../utils/Helpers/getDateBoundaries.js';
import getDate from '../../utils/Helpers/getDate.js';
import sortTasksByDate from '../../utils/Helpers/sortTasksByDate.js';
import './stylesheets/Dashboard.css';
import TaskSearchBar from '../../components/TaskSearchBar.jsx';
import sortTasksByCompletedAt from '../../utils/Helpers/sortTasksByCompletedAt.js';

/**
 * Dashboard component - main page displayed after successful login.
 * Displays tasks grouped by day sections (overdue, today, tomorrow, next 7 days, completed)
 * alongside a notes section.
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
        completedTasks, setCompletedTasks,
        totalTasks,
    } = useTasksByDateGroup(blocks);

    useBodyClass('dashboard-page');
    useScrollToTopOnResize();
    useAutoResetError(error, setError);

    const context = { setSubscriptions, setError, refetchBlocks };

    const onImport = (payload) => handleImportSubscription(payload, context);
    const onRefresh = (id) => handleRefreshSubscription(id, context);
    const onDelete = (id) => handleDeleteSubscription(id, context);

    function handleComplete(task, setSourceTasks) {
        completeTimeBlock(task.id)
            .then(() => {
                setSourceTasks((prev) => prev.filter((t) => t.id !== task.id));
                setCompletedTasks((prev) =>
                    [...prev, { ...task, completed_at: new Date().toISOString() }]
                        .sort(sortTasksByCompletedAt)
                );
            })
            .catch(() => {});
    }

    function handleUndoComplete(task) {
        undoCompleteTimeBlock(task.id)
            .then(() => {
                setCompletedTasks((prev) => prev.filter((t) => t.id !== task.id));

                const { today, tomorrow, dayAfterTomorrow, weekEnd } = getDateBoundaries();
                const taskDate = getDate(task);
                const restoredTask = { ...task, completed_at: null };

                if (taskDate < today)
                    setOverdueTasks((prev) => [...prev, restoredTask].sort(sortTasksByDate));
                else if (taskDate < tomorrow)
                    setTodayTasks((prev) => [...prev, restoredTask].sort(sortTasksByDate));
                else if (taskDate < dayAfterTomorrow)
                    setTomorrowTasks((prev) => [...prev, restoredTask].sort(sortTasksByDate));
                else if (taskDate <= weekEnd)
                    setWeekTasks((prev) => [...prev, restoredTask].sort(sortTasksByDate));
                else
                    setBeyondWeekTasks((prev) => [...prev, restoredTask].sort(sortTasksByDate));
            })
            .catch(() => {});
    }

    const filteredOverdue = useMemo(() => filterTasksForSearch(overdueTasks, searchTerm), [overdueTasks, searchTerm]);
    const filteredToday = useMemo(() => filterTasksForSearch(todayTasks, searchTerm), [todayTasks, searchTerm]);
    const filteredTomorrow = useMemo(() => filterTasksForSearch(tomorrowTasks, searchTerm), [tomorrowTasks, searchTerm]);
    const filteredWeek = useMemo(() => filterTasksForSearch(weekTasks, searchTerm), [weekTasks, searchTerm]);
    const filteredBeyondWeek = useMemo(() => filterTasksForSearch(beyondWeekTasks, searchTerm), [beyondWeekTasks, searchTerm]);
    const filteredCompleted = useMemo(() => filterTasksForSearch(completedTasks, searchTerm), [completedTasks, searchTerm]);

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

                <TaskSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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
                    filteredCompleted.length === 0 &&
                    searchTerm.trim() !== '' && (
                        <p className="no-tasks-message">
                            No tasks found matching "{searchTerm.trim()}"
                        </p>
                    )}

                <TaskGroup title="Overdue" tasks={filteredOverdue} setTasks={setOverdueTasks} overdue={true}
                           onComplete={(task) => handleComplete(task, setOverdueTasks)} />
                <TaskGroup title="Today" tasks={filteredToday} setTasks={setTodayTasks}
                           onComplete={(task) => handleComplete(task, setTodayTasks)} />
                <TaskGroup title="Tomorrow" tasks={filteredTomorrow} setTasks={setTomorrowTasks}
                           onComplete={(task) => handleComplete(task, setTomorrowTasks)} />
                <TaskGroup title="Next 7 Days" tasks={filteredWeek} setTasks={setWeekTasks}
                           onComplete={(task) => handleComplete(task, setWeekTasks)} />
                <TaskGroup title="After Next 7 Days" tasks={filteredBeyondWeek} setTasks={setBeyondWeekTasks}
                           onComplete={(task) => handleComplete(task, setBeyondWeekTasks)} />
                <TaskGroup title="Completed" tasks={filteredCompleted} setTasks={setCompletedTasks} completed={true}
                           onUndoComplete={(task) => handleUndoComplete(task)} />
            </div>
            <NotesSection />
        </div>
    );
}

export default Dashboard;
