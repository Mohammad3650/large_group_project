import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../Dashboard';

vi.mock('../../../utils/Hooks/useUsername.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useTimeBlocks.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useTasksByDateGroup.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useFilterTasksForSearch.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useBodyClass.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useScrollToTopOnResize.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/buildTaskGroups.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Helpers/getNoSearchResults.js', () => ({ default: vi.fn() }));
vi.mock('../stylesheets/Dashboard.css', () => ({}));
vi.mock('../NotesSection.jsx', () => ({
    default: () => <div data-testid="notes-section" />,
}));
vi.mock('../../../components/AddTaskButton.jsx', () => ({
    default: () => <button data-testid="add-task-button">+ Add Task</button>,
}));
vi.mock('../../../components/TaskSearchBar.jsx', () => ({
    default: ({ searchTerm, setSearchTerm }) => (
        <input
            data-testid="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    ),
}));
vi.mock('../TaskGroup.jsx', () => ({
    default: ({ title, tasks = [] }) =>
        tasks.length === 0 ? null : (
            <div data-testid={`task-group-${title}`}>
                <span>{title}</span>
                {tasks.map((t) => (
                    <div key={t.id}>{t.name}</div>
                ))}
            </div>
        ),
}));

import * as useUsernameModule from '../../../utils/Hooks/useUsername.js';
import * as useTimeBlocksModule from '../../../utils/Hooks/useTimeBlocks.js';
import * as useTasksByDateGroupModule from '../../../utils/Hooks/useTasksByDateGroup.js';
import * as useFilterTasksForSearchModule from '../../../utils/Hooks/useFilterTasksForSearch.js';
import * as buildTaskGroupsModule from '../../../utils/Helpers/buildTaskGroups.js';
import * as getNoSearchResultsModule from '../../../utils/Helpers/getNoSearchResults.js';

const mockTask = (id, name) => ({ id, name });

const defaultTaskGroupState = {
    pinnedTasks: [],
    setPinnedTasks: vi.fn(),
    overdueTasks: [mockTask(1, 'Overdue Task')],
    setOverdueTasks: vi.fn(),
    todayTasks: [mockTask(2, 'Today Task')],
    setTodayTasks: vi.fn(),
    tomorrowTasks: [],
    setTomorrowTasks: vi.fn(),
    weekTasks: [],
    setWeekTasks: vi.fn(),
    beyondWeekTasks: [],
    setBeyondWeekTasks: vi.fn(),
    completedTasks: [],
    setCompletedTasks: vi.fn(),
    totalTasks: 2,
};

const defaultFilteredTasks = {
    filteredPinned: [],
    filteredOverdue: [mockTask(1, 'Overdue Task')],
    filteredToday: [mockTask(2, 'Today Task')],
    filteredTomorrow: [],
    filteredWeek: [],
    filteredBeyondWeek: [],
    filteredCompleted: [],
};

const defaultTaskGroups = [
    { title: 'Overdue', variant: 'overdue', tasks: [mockTask(1, 'Overdue Task')], setTasks: vi.fn() },
    { title: 'Today', variant: 'today', tasks: [mockTask(2, 'Today Task')], setTasks: vi.fn() },
];

const renderDashboard = () => render(<Dashboard />);

describe('Tests for Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useUsernameModule.default.mockReturnValue({ username: 'testuser', error: '' });
        useTimeBlocksModule.default.mockReturnValue({ blocks: [], error: null });
        useTasksByDateGroupModule.default.mockReturnValue(defaultTaskGroupState);
        useFilterTasksForSearchModule.default.mockReturnValue(defaultFilteredTasks);
        buildTaskGroupsModule.default.mockReturnValue(defaultTaskGroups);
        getNoSearchResultsModule.default.mockReturnValue(false);
    });

    it('renders the welcome heading with the username', () => {
        renderDashboard();
        expect(screen.getByText('Welcome to your Dashboard, testuser!')).toBeInTheDocument();
    });

    it('renders the notes section', () => {
        renderDashboard();
        expect(screen.getByTestId('notes-section')).toBeInTheDocument();
    });

    it('renders the add task button', () => {
        renderDashboard();
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('renders the task search bar', () => {
        renderDashboard();
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('shows the no-tasks message when there are no tasks', () => {
        useTasksByDateGroupModule.default.mockReturnValue({ ...defaultTaskGroupState, totalTasks: 0 });
        renderDashboard();
        expect(screen.getByText('🎉 Congrats, you have no tasks!')).toBeInTheDocument();
    });

    it('does not show the no-tasks message when there are tasks', () => {
        renderDashboard();
        expect(screen.queryByText('🎉 Congrats, you have no tasks!')).not.toBeInTheDocument();
    });

    it('shows the no-search-results message when no tasks match the search term', () => {
        getNoSearchResultsModule.default.mockReturnValue(true);
        renderDashboard();
        fireEvent.change(screen.getByTestId('search-bar'), { target: { value: 'xyz' } });
        expect(screen.getByText('No tasks found matching "xyz"')).toBeInTheDocument();
    });

    it('does not show the no-search-results message when getNoSearchResults returns false', () => {
        renderDashboard();
        expect(screen.queryByText(/No tasks found matching/)).not.toBeInTheDocument();
    });

    it('renders task groups returned by buildTaskGroups', () => {
        renderDashboard();
        expect(screen.getByTestId('task-group-Overdue')).toBeInTheDocument();
        expect(screen.getByText('Overdue Task')).toBeInTheDocument();
        expect(screen.getByTestId('task-group-Today')).toBeInTheDocument();
        expect(screen.getByText('Today Task')).toBeInTheDocument();
    });

    it('does not render a task group when its tasks array is empty', () => {
        buildTaskGroupsModule.default.mockReturnValue([
            { title: 'Pinned', variant: 'pinned', tasks: [], setTasks: vi.fn() },
        ]);
        renderDashboard();
        expect(screen.queryByTestId('task-group-Pinned')).not.toBeInTheDocument();
    });

    it('renders an error message when fetching time blocks fails', () => {
        useTimeBlocksModule.default.mockReturnValue({ blocks: null, error: 'Failed to load time blocks' });
        renderDashboard();
        expect(screen.getByText('Failed to load time blocks')).toBeInTheDocument();
    });

    it('does not render the main dashboard content when there is a blocks error', () => {
        useTimeBlocksModule.default.mockReturnValue({ blocks: null, error: 'Failed to load time blocks' });
        renderDashboard();
        expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
        expect(screen.queryByTestId('notes-section')).not.toBeInTheDocument();
    });
});
