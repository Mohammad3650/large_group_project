import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskGroup from '../../TaskSection/TaskGroup.jsx';

vi.mock('../stylesheets/TaskGroup.css', () => ({}));
vi.mock('../../../utils/Helpers/getTitleClass.js', () => ({ default: vi.fn() }));
vi.mock('../TaskItemList.jsx', () => ({
    default: ({ tasks }) =>
        tasks.map((t) => <div key={t.id} data-testid={`task-item-${t.id}`}>{t.name}</div>),
}));

import * as getTitleClassModule from '../../utils/Helpers/getTitleClass.js';

const mockTasks = [
    { id: 1, name: 'Lecture' },
    { id: 2, name: 'Seminar' },
];

const renderTaskGroup = (props = {}) =>
    render(
        <TaskGroup
            title="Today"
            tasks={mockTasks}
            setTasks={vi.fn()}
            variant="today"
            {...props}
        />
    );

describe('Tests for TaskGroup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getTitleClassModule.default.mockReturnValue('');
    });

    it('renders null when the tasks array is empty', () => {
        const { container } = render(
            <TaskGroup title="Today" tasks={[]} setTasks={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders the section title', () => {
        renderTaskGroup();
        expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('renders the task count', () => {
        renderTaskGroup();
        expect(screen.getByText('(2)')).toBeInTheDocument();
    });

    it('renders all task items', () => {
        renderTaskGroup();
        expect(screen.getByText('Lecture')).toBeInTheDocument();
        expect(screen.getByText('Seminar')).toBeInTheDocument();
    });

    it('collapses the task list when the header is clicked', () => {
        renderTaskGroup();
        fireEvent.click(screen.getByTestId('task-group-header'));
        expect(screen.queryByText('Lecture')).not.toBeInTheDocument();
        expect(screen.queryByText('Seminar')).not.toBeInTheDocument();
    });

    it('expands the task list again when the header is clicked a second time', () => {
        renderTaskGroup();
        fireEvent.click(screen.getByTestId('task-group-header'));
        fireEvent.click(screen.getByTestId('task-group-header'));
        expect(screen.getByText('Lecture')).toBeInTheDocument();
        expect(screen.getByText('Seminar')).toBeInTheDocument();
    });

    it('passes the class returned by getTitleClass to the heading', () => {
        getTitleClassModule.default.mockReturnValue('overdue-title');
        renderTaskGroup({ variant: 'overdue', title: 'Overdue' });
        expect(screen.getByText('Overdue')).toHaveClass('overdue-title');
    });

    it('calls getTitleClass with the variant prop', () => {
        renderTaskGroup({ variant: 'completed' });
        expect(getTitleClassModule.default).toHaveBeenCalledWith('completed');
    });
});
