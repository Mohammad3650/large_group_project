import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskGroup from '../TaskGroup';
import * as deleteTimeBlockModule from '../../../utils/Api/deleteTimeBlock.js';

vi.mock('../stylesheets/TaskGroup.css', () => ({}));
vi.mock('../../../utils/Api/deleteTimeBlock.js', () => ({
    default: vi.fn()
}));
vi.mock('../TaskItem.jsx', () => ({
    default: ({ name, onDelete }) => (
        <div>
            <span>{name}</span>
            <button onClick={onDelete}>Delete</button>
        </div>
    )
}));

const mockTasks = [
    {
        id: 1,
        name: 'Lecture',
        date: '2026-03-18',
        startTime: '09:00',
        endTime: '10:00'
    },
    {
        id: 2,
        name: 'Seminar',
        date: '2026-03-18',
        startTime: '11:00',
        endTime: '12:00'
    }
];

const renderTaskGroup = (props = {}) =>
    render(
        <TaskGroup
            title="Today"
            tasks={mockTasks}
            setTasks={vi.fn()}
            {...props}
        />
    );

describe('Tests for TaskGroup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

    it('renders all task items by default', () => {
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

    it('applies the overdue-title class to the heading when overdue is true', () => {
        renderTaskGroup({ title: 'Overdue', overdue: true });
        expect(screen.getByText('Overdue')).toHaveClass('overdue-title');
    });

    it('does not apply the overdue-title class when overdue is false', () => {
        renderTaskGroup({ overdue: false });
        expect(screen.getByText('Today')).not.toHaveClass('overdue-title');
    });

    it('calls deleteTimeBlock and removes the task on successful deletion', async () => {
        deleteTimeBlockModule.default.mockResolvedValue({});
        const setTasks = vi.fn();
        renderTaskGroup({ setTasks });

        fireEvent.click(screen.getAllByText('Delete')[0]);

        await vi.waitFor(() =>
            expect(deleteTimeBlockModule.default).toHaveBeenCalledWith(1)
        );
        await vi.waitFor(() => expect(setTasks).toHaveBeenCalled());

        const filterFn = setTasks.mock.calls[0][0];
        expect(filterFn(mockTasks)).toEqual([mockTasks[1]]);
    });

    it('does not throw when deletion fails', async () => {
        deleteTimeBlockModule.default.mockRejectedValue(
            new Error('Network error')
        );
        renderTaskGroup();

        fireEvent.click(screen.getAllByText('Delete')[0]);

        await vi.waitFor(() =>
            expect(deleteTimeBlockModule.default).toHaveBeenCalledWith(1)
        );
    });
});