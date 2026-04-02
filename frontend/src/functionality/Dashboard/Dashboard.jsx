import { useState } from 'react';
import TaskGroup from './TaskGroup.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import NotesSection from './NotesSection.jsx';
import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import useTasksByDateGroup from '../../utils/Hooks/useTasksByDateGroup.js';
import useDashboard from '../../utils/Hooks/useDashboard.js';
import useSubscriptions from '../../utils/Hooks/useSubscriptions.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import useScrollToTopOnResize from '../../utils/Hooks/useScrollToTopOnResize.js';
import useAutoResetError from '../../utils/Hooks/useAutoResetError.js';
import useSubscriptionActions from '../../utils/Hooks/useSubscriptionActions.js';
import handleCompleteTask from '../../utils/Helpers/handleCompleteTask.js';
import handleUndoCompleteTask from '../../utils/Helpers/handleUndoCompleteTask.js';
import useFilterTasks from '../../utils/Hooks/useFilterTasks.js';
import SubscriptionSection from './SubscriptionSection.jsx';
import NoTasksMessage from './NoTasksMessage.jsx';
import TaskSearchBar from '../../components/TaskSearchBar.jsx';
import ExportCsvButton from '../../components/ExportCsvButton.jsx';
import ExportIcsButton from '../../components/ExportIcsButton.jsx';
import './stylesheets/Dashboard.css';

/**
 * Dashboard component — main page displayed after successful login.
 * Displays a searchable task list grouped by date (overdue, today, tomorrow,
 * next 7 days, beyond next 7 days, and completed), export buttons, a timetable
 * subscription manager, and a notes section.
 *
 * @returns {JSX.Element} The dashboard page
 */
function Dashboard() {
    const [error, setError] = useState('');
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

    const { onImport, onRefresh, onDelete } = useSubscriptionActions({ setSubscriptions, setError, refetchBlocks });

    const taskSetters = { setCompletedTasks, setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks };

    const { filteredOverdue, filteredToday, filteredTomorrow,
        filteredWeek, filteredBeyondWeek, filteredCompleted } =
        useFilterTasks({ overdueTasks, todayTasks, tomorrowTasks,
            weekTasks, beyondWeekTasks, completedTasks }, searchTerm);

    if (blocksError) return <p>{blocksError}</p>;

    return (
        <div className="dashboard-content">
            <div className="task-section">
                <h1>{message}</h1>

                <div className="header-actions">
                    <div className="add-task">
                        <AddTaskButton />
                    </div>

                    <div className="export-buttons">
                        <ExportCsvButton setError={setError} />
                        <ExportIcsButton setError={setError} />
                    </div>
                </div>

                <SubscriptionSection
                    subscriptions={subscriptions}
                    error={error}
                    onImport={onImport}
                    onRefresh={onRefresh}
                    onDelete={onDelete}
                />

                <TaskSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                <NoTasksMessage
                    totalTasks={totalTasks}
                    filteredOverdue={filteredOverdue}
                    filteredToday={filteredToday}
                    filteredTomorrow={filteredTomorrow}
                    filteredWeek={filteredWeek}
                    filteredBeyondWeek={filteredBeyondWeek}
                    filteredCompleted={filteredCompleted}
                    searchTerm={searchTerm}
                />

                <TaskGroup title="Overdue" tasks={filteredOverdue} setTasks={setOverdueTasks} overdue={true}
                           onComplete={(task) => handleCompleteTask(task, setOverdueTasks, setCompletedTasks)} />
                <TaskGroup title="Today" tasks={filteredToday} setTasks={setTodayTasks}
                           onComplete={(task) => handleCompleteTask(task, setTodayTasks, setCompletedTasks)} />
                <TaskGroup title="Tomorrow" tasks={filteredTomorrow} setTasks={setTomorrowTasks}
                           onComplete={(task) => handleCompleteTask(task, setTomorrowTasks, setCompletedTasks)} />
                <TaskGroup title="Next 7 Days" tasks={filteredWeek} setTasks={setWeekTasks}
                           onComplete={(task) => handleCompleteTask(task, setWeekTasks, setCompletedTasks)} />
                <TaskGroup title="After Next 7 Days" tasks={filteredBeyondWeek} setTasks={setBeyondWeekTasks}
                           onComplete={(task) => handleCompleteTask(task, setBeyondWeekTasks, setCompletedTasks)} />
                <TaskGroup title="Completed" tasks={filteredCompleted} setTasks={setCompletedTasks} completed={true}
                           onUndoComplete={(task) => handleUndoCompleteTask(task, taskSetters)} />
            </div>
            <NotesSection />
        </div>
    );
}

export default Dashboard;
