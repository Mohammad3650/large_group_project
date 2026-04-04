import { useState, useMemo } from 'react';
import TaskGroup from './TaskGroup.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import NotesSection from './NotesSection.jsx';
import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import useTasksByDateGroup from '../../utils/Hooks/useTasksByDateGroup.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import useScrollToTopOnResize from '../../utils/Hooks/useScrollToTopOnResize.js';
import handleCompleteTask from '../../utils/Helpers/handleCompleteTask.js';
import handleUndoCompleteTask from '../../utils/Helpers/handleUndoCompleteTask.js';
import handlePinTask from '../../utils/Helpers/handlePinTask.js';
import handleUnpinTask from '../../utils/Helpers/handleUnpinTask.js';
import TaskSearchBar from '../../components/TaskSearchBar.jsx';
import filterTasksForSearch from '../../utils/Helpers/filterTasksForSearch.js';
import './stylesheets/Dashboard.css';

/**
 * Dashboard component — main page displayed after successful login.
 * Displays tasks grouped by category (pinned, overdue, today, tomorrow,
 * next 7 days, beyond, completed) alongside a notes section.
 *
 * @returns {JSX.Element} The dashboard page
 */
function Dashboard() {
    const [searchTerm, setSearchTerm] = useState('');

    const { blocks, error: blocksError } = useTimeBlocks();

    const {
        pinnedTasks, setPinnedTasks,
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

    const dateGroupSetters = { setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks };

    const filteredPinned = useMemo(() => filterTasksForSearch(pinnedTasks, searchTerm), [pinnedTasks, searchTerm]);
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
                <h1>Test</h1>

                <AddTaskButton />

                <TaskSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                {totalTasks === 0 && (
                    <p className="no-tasks-message">
                        🎉 Congrats, you have no tasks!
                    </p>
                )}

                {totalTasks > 0 &&
                    filteredPinned.length === 0 &&
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

                <TaskGroup title="Pinned" variant="pinned" tasks={filteredPinned} setTasks={setPinnedTasks}
                           onComplete={(task) => handleCompleteTask(task, setPinnedTasks, setCompletedTasks)}
                           onUnpin={(task) => handleUnpinTask(task, { setPinnedTasks, setCompletedTasks, ...dateGroupSetters })} />
                <TaskGroup title="Overdue" variant="overdue" tasks={filteredOverdue} setTasks={setOverdueTasks} overdue={true}
                           onComplete={(task) => handleCompleteTask(task, setOverdueTasks, setCompletedTasks)}
                           onPin={(task) => handlePinTask(task, setOverdueTasks, setPinnedTasks)} />
                <TaskGroup title="Today" variant="today" tasks={filteredToday} setTasks={setTodayTasks}
                           onComplete={(task) => handleCompleteTask(task, setTodayTasks, setCompletedTasks)}
                           onPin={(task) => handlePinTask(task, setTodayTasks, setPinnedTasks)} />
                <TaskGroup title="Tomorrow" variant="tomorrow" tasks={filteredTomorrow} setTasks={setTomorrowTasks}
                           onComplete={(task) => handleCompleteTask(task, setTomorrowTasks, setCompletedTasks)}
                           onPin={(task) => handlePinTask(task, setTomorrowTasks, setPinnedTasks)} />
                <TaskGroup title="Next 7 Days" variant="week" nextWeek={true} tasks={filteredWeek} setTasks={setWeekTasks}
                           onComplete={(task) => handleCompleteTask(task, setWeekTasks, setCompletedTasks)}
                           onPin={(task) => handlePinTask(task, setWeekTasks, setPinnedTasks)} />
                <TaskGroup title="After Next 7 Days" variant="beyond" tasks={filteredBeyondWeek} setTasks={setBeyondWeekTasks}
                           onComplete={(task) => handleCompleteTask(task, setBeyondWeekTasks, setCompletedTasks)}
                           onPin={(task) => handlePinTask(task, setBeyondWeekTasks, setPinnedTasks)} />
                <TaskGroup title="Completed" variant="completed" tasks={filteredCompleted} setTasks={setCompletedTasks} completed={true}
                           onUndoComplete={(task) => handleUndoCompleteTask(task, { setCompletedTasks, ...dateGroupSetters })}
                           onPin={(task) => handlePinTask(task, setCompletedTasks, setPinnedTasks)} />
            </div>
            <NotesSection />
        </div>
    );
}

export default Dashboard;