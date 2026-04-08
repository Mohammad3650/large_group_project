import { useState } from 'react';
import TaskGroup from './TaskGroup.jsx';
import TaskSearchBar from '../../components/TaskSearchBar.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import NotesSection from './NotesSection.jsx';
import NoTasksMessage from './NoTasksMessage.jsx';
import buildTaskGroups from '../../utils/Helpers/buildTaskGroups.js';
import useTimeBlocks from '../../utils/Hooks/useTimeBlocks.js';
import useTasksByDateGroup from '../../utils/Hooks/useTasksByDateGroup.js';
import useFilterTasksForSearch from '../../utils/Hooks/useFilterTasksForSearch.js';
import useUsername from '../../utils/Hooks/useUsername.js';
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

    const { username } = useUsername(true);

    const { filteredTasks } = useFilterTasksForSearch(
        { pinnedTasks, overdueTasks, todayTasks, tomorrowTasks, weekTasks, beyondWeekTasks, completedTasks },
        searchTerm
    );

    if (blocksError) return <p>{blocksError}</p>;

    const setters = { setPinnedTasks, setOverdueTasks, setTodayTasks, setTomorrowTasks, setWeekTasks, setBeyondWeekTasks, setCompletedTasks };
    const taskGroups = buildTaskGroups(filteredTasks, setters);

    return (
        <div className="dashboard-content">
            <div className="task-section">
                <h1>Welcome to your Dashboard, {username}!</h1>

                <AddTaskButton />

                <TaskSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                <NoTasksMessage
                    totalTasks={totalTasks}
                    filteredTasks={filteredTasks}
                    searchTerm={searchTerm}
                />

                {taskGroups.map(({ title, ...props }) => (
                    <TaskGroup key={title} title={title} {...props} />
                ))}
            </div>
            <NotesSection />
        </div>
    );
}

export default Dashboard;