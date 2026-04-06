import { useState } from 'react';
import TaskGroup from './TaskGroup.jsx';
import TaskSearchBar from '../../components/TaskSearchBar.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import NotesSection from './NotesSection.jsx';
import buildTaskGroups from '../../utils/Helpers/buildTaskGroups.js';
import getNoSearchResults from '../../utils/Helpers/getNoSearchResults.js';
import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import useTasksByDateGroup from '../../utils/Hooks/useTasksByDateGroup.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import useScrollToTopOnResize from '../../utils/Hooks/useScrollToTopOnResize.js';
import useFilterTasksForSearch from '../../utils/Hooks/useFilterTasksForSearch.js';
import './stylesheets/Dashboard.css';

/**
 * Dashboard component — main page displayed after successful login.
 * Displays tasks grouped by category (pinned, overdue, today, tomorrow,
 * next 7 days, beyond next 7 days, and completed) alongside a notes section.
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

    const {
        filteredPinned, filteredOverdue, filteredToday, filteredTomorrow,
        filteredWeek, filteredBeyondWeek, filteredCompleted,
    } = useFilterTasksForSearch(
        { pinnedTasks, overdueTasks, todayTasks, tomorrowTasks, weekTasks, beyondWeekTasks, completedTasks },
        searchTerm
    );

    const filteredTasks = { filteredPinned, filteredOverdue, filteredToday, filteredTomorrow, filteredWeek, filteredBeyondWeek, filteredCompleted };
    const setters = { setPinnedTasks, setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks, setCompletedTasks };

    const noSearchResults = getNoSearchResults(totalTasks, searchTerm, [
        filteredPinned, filteredOverdue, filteredToday, filteredTomorrow,
        filteredWeek, filteredBeyondWeek, filteredCompleted,
    ]);
    const taskGroups = buildTaskGroups(filteredTasks, setters);

    if (blocksError) return <p>{blocksError}</p>;

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

                {noSearchResults && (
                    <p className="no-tasks-message">
                        No tasks found matching "{searchTerm.trim()}"
                    </p>
                )}

                {taskGroups.map(({ title, ...props }) => (
                    <TaskGroup key={title} title={title} {...props} />
                ))}
            </div>
            <NotesSection />
        </div>
    );
}

export default Dashboard;
