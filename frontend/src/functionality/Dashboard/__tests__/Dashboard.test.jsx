import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../Dashboard.jsx';

vi.mock('../utils/Hooks/useDashboard.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Hooks/useBodyClass.js', () => ({ default: vi.fn() }));
vi.mock('../stylesheets/Dashboard.css', () => ({}));
vi.mock('../TaskSection/TaskGroup.jsx', () => ({
    default: ({ title, tasks = [] }) =>
        tasks.length === 0 ? null : (
            <div data-testid={`task-group-${title}`}>
                {tasks.map((task) => <div key={task.id}>{task.name}</div>)}
            </div>
        ),
}));
vi.mock('../../../components/WelcomeMessage.jsx', () => ({
    default: ({ username }) => <h1>Welcome, {username}!</h1>,
}));
vi.mock('../TaskSearchBar.jsx', () => ({
    default: ({ searchTerm, setSearchTerm }) => (
        <input
            data-testid="search-bar"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
        />
    ),
}));
vi.mock('../../../components/AddTaskButton.jsx', () => ({
    default: () => <button data-testid="add-task-button">+ Add Task</button>,
}));
vi.mock('../NotesSection/NotesSection.jsx', () => ({
    default: () => <div data-testid="notes-section" />,
}));
vi.mock('../TaskSection/NoTasksMessage.jsx', () => ({
    default: ({ totalTasks, filteredTasks, searchTerm }) => {
        if (totalTasks === 0) return <p>🎉 Congrats, you have no tasks!</p>;
        const noResults =
            Object.values(filteredTasks).every((taskGroup) => taskGroup.length === 0) &&
            searchTerm.trim() !== '';
        if (noResults) return <p>No tasks found matching "{searchTerm.trim()}"</p>;
        return null;
    },
}));
vi.mock('../../../components/ErrorMessage.jsx', () => ({
    default: ({ error }) => <p data-testid="error-message">{error}</p>,
}));

import * as useDashboardModule from '../utils/Hooks/useDashboard.js';

const mockTask = (id, name) => ({ id, name });

const defaultFilteredTasks = {
    filteredPinned: [],
    filteredOverdue: [mockTask(1, 'Overdue Task')],
    filteredToday: [mockTask(2, 'Today Task')],
    filteredTomorrow: [],
    filteredWeek: [],
    filteredBeyondWeek: [],
    filteredCompleted: [],
};

const defaultDashboardState = {
    blocksError: null,
    username: 'testuser',
    searchTerm: '',
    setSearchTerm: vi.fn(),
    taskGroups: [
        { title: 'Overdue', variant: 'overdue', tasks: [mockTask(1, 'Overdue Task')], setTasks: vi.fn() },
        { title: 'Today', variant: 'today', tasks: [mockTask(2, 'Today Task')], setTasks: vi.fn() },
    ],
    totalTasks: 2,
    filteredTasks: defaultFilteredTasks,
};

const renderDashboard = () => render(<Dashboard />);

describe('Dashboard component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useDashboardModule.default.mockReturnValue(defaultDashboardState);
    });

    it('renders the username in the welcome message', () => {
        renderDashboard();
        expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    });

    it('renders the notes section', () => {
        renderDashboard();
        expect(screen.getByTestId('notes-section')).toBeInTheDocument();
    });

    it('renders the add task button', () => {
        renderDashboard();
        expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    });

    it('renders the search bar', () => {
        renderDashboard();
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('calls setSearchTerm when the search bar value changes', () => {
        const setSearchTerm = vi.fn();
        useDashboardModule.default.mockReturnValue({ ...defaultDashboardState, setSearchTerm });
        renderDashboard();
        fireEvent.change(screen.getByTestId('search-bar'), { target: { value: 'lecture' } });
        expect(setSearchTerm).toHaveBeenCalledWith('lecture');
    });

    it('renders task groups returned by useDashboard', () => {
        renderDashboard();
        expect(screen.getByTestId('task-group-Overdue')).toBeInTheDocument();
        expect(screen.getByTestId('task-group-Today')).toBeInTheDocument();
    });

    it('does not render a task group when its tasks array is empty', () => {
        useDashboardModule.default.mockReturnValue({
            ...defaultDashboardState,
            taskGroups: [{ title: 'Pinned', variant: 'pinned', tasks: [], setTasks: vi.fn() }],
        });
        renderDashboard();
        expect(screen.queryByTestId('task-group-Pinned')).not.toBeInTheDocument();
    });

    it('shows the no-tasks message when totalTasks is 0', () => {
        useDashboardModule.default.mockReturnValue({ ...defaultDashboardState, totalTasks: 0, taskGroups: [] });
        renderDashboard();
        expect(screen.getByText('🎉 Congrats, you have no tasks!')).toBeInTheDocument();
    });

    it('shows the no-search-results message when search yields no matches', () => {
        useDashboardModule.default.mockReturnValue({
            ...defaultDashboardState,
            searchTerm: 'xyz',
            filteredTasks: {
                filteredPinned: [], filteredOverdue: [], filteredToday: [],
                filteredTomorrow: [], filteredWeek: [], filteredBeyondWeek: [], filteredCompleted: [],
            },
        });
        renderDashboard();
        expect(screen.getByText('No tasks found matching "xyz"')).toBeInTheDocument();
    });

    it('does not show the no-search-results message when tasks match the search', () => {
        renderDashboard();
        expect(screen.queryByText(/No tasks found matching/)).not.toBeInTheDocument();
    });

    it('renders an error message when blocksError is set', () => {
        useDashboardModule.default.mockReturnValue({ ...defaultDashboardState, blocksError: 'Failed to load' });
        renderDashboard();
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });

    it('does not render dashboard content when there is a blocksError', () => {
        useDashboardModule.default.mockReturnValue({ ...defaultDashboardState, blocksError: 'error' });
        renderDashboard();
        expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
        expect(screen.queryByTestId('notes-section')).not.toBeInTheDocument();
    });
});