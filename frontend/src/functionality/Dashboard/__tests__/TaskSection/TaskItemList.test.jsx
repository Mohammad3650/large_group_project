import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItemList from '../../TaskSection/TaskItemList.jsx';

vi.mock('../../utils/Helpers/handleDeleteDashboardTask.js', () => ({ default: vi.fn() }));
vi.mock('../../utils/Helpers/getDate.js', () => ({ default: vi.fn() }));
vi.mock('../../utils/Helpers/getDateBoundaries.js', () => ({ default: vi.fn() }));
vi.mock('../../TaskSection/TaskItem.jsx', () => ({
    default: ({ task, onDelete, onComplete, onUndoComplete, onPin, onUnpin, overdue, completed }) => (
        <div
            data-testid={`task-item-${task.id}`}
            data-overdue={String(overdue)}
            data-completed={String(completed)}
        >
            <span>{task.name}</span>
            <button onClick={onDelete}>Delete</button>
            {onComplete && <button onClick={() => onComplete()}>Complete</button>}
            {onUndoComplete && <button onClick={() => onUndoComplete()}>Undo</button>}
            {onPin && <button onClick={() => onPin()}>Pin</button>}
            {onUnpin && <button onClick={() => onUnpin()}>Unpin</button>}
        </div>
    ),
}));

import * as handleDeleteTaskModule from '../../utils/Helpers/handleDeleteDashboardTask.js';
import * as getDateModule from '../../utils/Helpers/getDate.js';
import * as getDateBoundariesModule from '../../utils/Helpers/getDateBoundaries.js';

const TODAY = new Date('2026-04-06T00:00:00');
const YESTERDAY = new Date('2026-04-05T00:00:00');

const mockTask = (overrides = {}) => ({
    id: 1, name: 'Lecture', date: '2026-04-06',
    startTime: '09:00', endTime: '10:00', completed_at: null, ...overrides,
});

const mockTasks = [
    mockTask({ id: 1, name: 'Lecture' }),
    mockTask({ id: 2, name: 'Seminar' }),
];

const renderTaskItemList = (props = {}) =>
    render(
        <TaskItemList
            tasks={mockTasks}
            title="Today"
            overdue={false}
            completed={false}
            setTasks={vi.fn()}
            {...props}
        />
    );

describe('TaskItemList component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getDateBoundariesModule.default.mockReturnValue({ today: TODAY });
        getDateModule.default.mockReturnValue(TODAY);
    });

    it('renders a TaskItem for each task', () => {
        renderTaskItemList();
        expect(screen.getByText('Lecture')).toBeInTheDocument();
        expect(screen.getByText('Seminar')).toBeInTheDocument();
    });

    it('does not mark tasks as overdue when their date equals today', () => {
        renderTaskItemList();
        expect(screen.getByTestId('task-item-1')).toHaveAttribute('data-overdue', 'false');
    });

    it('marks a task as overdue when its date is before today and it has no completed_at', () => {
        getDateModule.default.mockReturnValue(YESTERDAY);
        renderTaskItemList({ tasks: [mockTask({ id: 1, completed_at: null })] });
        expect(screen.getByTestId('task-item-1')).toHaveAttribute('data-overdue', 'true');
    });

    it('does not mark a task as overdue when it has a completed_at value', () => {
        getDateModule.default.mockReturnValue(YESTERDAY);
        renderTaskItemList({ tasks: [mockTask({ id: 1, completed_at: '2026-04-05T10:00:00Z' })] });
        expect(screen.getByTestId('task-item-1')).toHaveAttribute('data-overdue', 'false');
    });

    it('marks all tasks as overdue when the overdue flag is true', () => {
        renderTaskItemList({ overdue: true });
        expect(screen.getByTestId('task-item-1')).toHaveAttribute('data-overdue', 'true');
        expect(screen.getByTestId('task-item-2')).toHaveAttribute('data-overdue', 'true');
    });

    it('marks a task as completed when it has a completed_at value', () => {
        renderTaskItemList({ tasks: [mockTask({ id: 1, completed_at: '2026-04-06T10:00:00Z' })] });
        expect(screen.getByTestId('task-item-1')).toHaveAttribute('data-completed', 'true');
    });

    it('marks all tasks as completed when the completed flag is true', () => {
        renderTaskItemList({ completed: true });
        expect(screen.getByTestId('task-item-1')).toHaveAttribute('data-completed', 'true');
        expect(screen.getByTestId('task-item-2')).toHaveAttribute('data-completed', 'true');
    });

    it('calls handleDeleteDashboardTask with the correct id and setTasks when delete is clicked', () => {
        const setTasks = vi.fn();
        renderTaskItemList({ setTasks });
        fireEvent.click(screen.getAllByText('Delete')[0]);
        expect(handleDeleteTaskModule.default).toHaveBeenCalledWith(1, setTasks);
    });

    it('calls onComplete with the correct task when the complete button is clicked', () => {
        const onComplete = vi.fn();
        renderTaskItemList({ onComplete });
        fireEvent.click(screen.getAllByText('Complete')[0]);
        expect(onComplete).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('calls onUndoComplete with the correct task when the undo button is clicked', () => {
        const onUndoComplete = vi.fn();
        renderTaskItemList({ onUndoComplete });
        fireEvent.click(screen.getAllByText('Undo')[0]);
        expect(onUndoComplete).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('calls onPin with the correct task when the pin button is clicked', () => {
        const onPin = vi.fn();
        renderTaskItemList({ onPin });
        fireEvent.click(screen.getAllByText('Pin')[0]);
        expect(onPin).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('calls onUnpin with the correct task when the unpin button is clicked', () => {
        const onUnpin = vi.fn();
        renderTaskItemList({ onUnpin });
        fireEvent.click(screen.getAllByText('Unpin')[0]);
        expect(onUnpin).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('does not render action buttons when no callbacks are provided', () => {
        renderTaskItemList();
        expect(screen.queryByText('Complete')).not.toBeInTheDocument();
        expect(screen.queryByText('Undo')).not.toBeInTheDocument();
        expect(screen.queryByText('Pin')).not.toBeInTheDocument();
        expect(screen.queryByText('Unpin')).not.toBeInTheDocument();
    });
});