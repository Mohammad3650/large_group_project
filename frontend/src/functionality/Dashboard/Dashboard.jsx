import TaskGroup from './TaskSection/TaskGroup.jsx';
import WelcomeMessage from '../../components/WelcomeMessage.jsx';
import TaskSearchBar from './TaskSearchBar.jsx';
import AddTaskButton from '../../components/AddTaskButton.jsx';
import NotesSection from './NotesSection/NotesSection.jsx';
import NoTasksMessage from './TaskSection/NoTasksMessage.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import useDashboard from './utils/Hooks/useDashboard.js';
import useBodyClass from '../../utils/Hooks/useBodyClass.js';
import './stylesheets/Dashboard.css';

/**
 * Dashboard component — main page displayed after successful login.
 * Displays tasks grouped by category (pinned, overdue, today, tomorrow,
 * next 7 days, beyond next 7 days, and completed) alongside a notes section.
 *
 * @returns {React.JSX.Element} The dashboard page
 */
function Dashboard() {
    useBodyClass('dashboard-page');

    const { blocksError, username, searchTerm, setSearchTerm, taskGroups, totalTasks, filteredTasks } = useDashboard();

    if (blocksError) return <ErrorMessage error={blocksError} />;
    return (
        <div className="dashboard-content">
            <div className="task-section">
                <WelcomeMessage page="dashboard" username={username} />

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