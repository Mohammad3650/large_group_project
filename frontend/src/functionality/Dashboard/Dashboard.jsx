import { useState } from 'react';
import TaskGroup from './TaskGroup.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import NotesSection from './NotesSection.jsx';
import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import useTasksByDateGroup from '../../utils/Hooks/useTasksByDateGroup.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import useScrollToTopOnResize from '../../utils/Hooks/useScrollToTopOnResize.js';
import useUsername from '../../utils/Hooks/useUsername.js';
import handleCompleteTask from '../../utils/Helpers/handleCompleteTask.js';
import handleUndoCompleteTask from '../../utils/Helpers/handleUndoCompleteTask.js';
import useFilterTasks from '../../utils/Hooks/useFilterTasks.js';
import NoTasksMessage from './NoTasksMessage.jsx';
import TaskSearchBar from '../../components/TaskSearchBar.jsx';
import './stylesheets/Dashboard.css';

/**
 * Dashboard component — main page displayed after successful login.
 * Displays a searchable task list grouped by date (overdue, today, tomorrow,
 * next 7 days, beyond next 7 days, and completed) alongside a notes section.
 *
 * @returns {JSX.Element} The dashboard page
 */
function Dashboard() {
    const [searchTerm, setSearchTerm] = useState('');

    const { username } = useUsername(true);
    const { blocks, error: blocksError } = useTimeBlocks();

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

    const taskSetters = { setCompletedTasks, setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks };

    const { filteredOverdue, filteredToday, filteredTomorrow,
        filteredWeek, filteredBeyondWeek, filteredCompleted } =
        useFilterTasks({ overdueTasks, todayTasks, tomorrowTasks,
            weekTasks, beyondWeekTasks, completedTasks }, searchTerm);

    if (blocksError) return <p>{blocksError}</p>;

    return (
        <div className="dashboard-content">
            <div className="task-section">
                <h1>{`Welcome to your dashboard, ${username}!`}</h1>
                <AddTaskButton />

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

                <TaskGroup title="Overdue" variant="overdue" tasks={filteredOverdue} setTasks={setOverdueTasks} overdue={true}
                           onComplete={(task) => handleCompleteTask(task, setOverdueTasks, setCompletedTasks)} />
                <TaskGroup title="Today" variant="today" tasks={filteredToday} setTasks={setTodayTasks}
                           onComplete={(task) => handleCompleteTask(task, setTodayTasks, setCompletedTasks)} />
                <TaskGroup title="Tomorrow" variant="tomorrow" tasks={filteredTomorrow} setTasks={setTomorrowTasks}
                           onComplete={(task) => handleCompleteTask(task, setTomorrowTasks, setCompletedTasks)} />
                <TaskGroup title="Next 7 Days" variant="week" tasks={filteredWeek} setTasks={setWeekTasks}
                           onComplete={(task) => handleCompleteTask(task, setWeekTasks, setCompletedTasks)} />
                <TaskGroup title="After Next 7 Days" variant="beyond" tasks={filteredBeyondWeek} setTasks={setBeyondWeekTasks}
                           onComplete={(task) => handleCompleteTask(task, setBeyondWeekTasks, setCompletedTasks)} />
                <TaskGroup title="Completed" variant="completed" tasks={filteredCompleted} setTasks={setCompletedTasks} completed={true}
                           onUndoComplete={(task) => handleUndoCompleteTask(task, taskSetters)} />
            </div>
            <NotesSection />
        </div>
    );
}

export default Dashboard;
