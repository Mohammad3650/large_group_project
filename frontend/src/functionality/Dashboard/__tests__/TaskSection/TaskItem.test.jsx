import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TaskItem from '../../TaskSection/TaskItem.jsx';

vi.mock('../../stylesheets/TaskSection/TaskItem.css', () => ({}));
vi.mock('../../utils/Audio/playDing.js', () => ({ default: vi.fn() }));
vi.mock('../../TaskSection/TaskItemContent.jsx', () => ({
    default: ({ name, checked, fading, overdue, completed, onClick }) => (
        <div className={`task-content${fading ? ' fading' : ''}`} onClick={onClick}>
            <input type="checkbox" readOnly checked={checked} />
            <span className={overdue ? 'overdue-text' : completed ? 'completed-text' : ''}>
                {name}
            </span>
        </div>
    ),
}));
vi.mock('../../TaskOptionsDropup/TaskOptionsButton.jsx', () => ({
    default: ({ onViewDetails, onDelete, onUndoComplete }) => (
        <div data-testid="task-options-button">
            <button onClick={onDelete}>Delete</button>
            {onUndoComplete && <button onClick={onUndoComplete}>Undo</button>}
            <button onClick={onViewDetails}>View Details</button>
        </div>
    ),
}));
vi.mock('../../TaskDetailsPopup/TaskDetailsPopup.jsx', () => ({
    default: ({ onClose }) => (
        <div data-testid="task-details-popup">
            <button onClick={onClose}>Close Details</button>
        </div>
    ),
}));
vi.mock('../../TaskSection/PinButton.jsx', () => ({
    default: ({ onPin, onUnpin }) => (
        <div data-testid="pin-button">
            {onPin && <button onClick={onPin}>Pin</button>}
            {onUnpin && <button onClick={onUnpin}>Unpin</button>}
        </div>
    ),
}));

import * as playDingModule from '../../utils/Audio/playDing.js';

const mockTask = {
    id: 1,
    name: 'Finish coursework',
    date: '2026-03-18',
    startTime: '09:00',
    endTime: '10:00',
    pinned: false,
    completed_at: null,
};

const defaultProps = {
    task: mockTask,
    onDelete: vi.fn(),
    overdue: false,
    completed: false,
};

const renderTaskItem = (props = {}) =>
    render(<TaskItem {...defaultProps} {...props} />);

describe('TaskItem component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the task name', () => {
        renderTaskItem();
        expect(screen.getByText('Finish coursework')).toBeInTheDocument();
    });

    it('renders the checkbox as unchecked by default', () => {
        renderTaskItem();
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('applies the overdue-text class when overdue is true', () => {
        renderTaskItem({ overdue: true });
        expect(screen.getByText('Finish coursework')).toHaveClass('overdue-text');
    });

    it('applies the completed-text class when completed is true', () => {
        renderTaskItem({ completed: true });
        expect(screen.getByText('Finish coursework')).toHaveClass('completed-text');
    });

    it('does not apply any special class when neither overdue nor completed', () => {
        renderTaskItem();
        const nameEl = screen.getByText('Finish coursework');
        expect(nameEl).not.toHaveClass('overdue-text');
        expect(nameEl).not.toHaveClass('completed-text');
    });

    it('checks the checkbox and starts fading when clicked', async () => {
        renderTaskItem({ onComplete: vi.fn() });
        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox').closest('div'));
        });
        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getByRole('checkbox').closest('div')).toHaveClass('fading');
    });

    it('calls playDing when the task content is clicked', async () => {
        renderTaskItem({ onComplete: vi.fn() });
        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox').closest('div'));
        });
        expect(playDingModule.default).toHaveBeenCalled();
    });

    it('calls onComplete after 500ms when the task content is clicked', async () => {
        const onComplete = vi.fn();
        renderTaskItem({ onComplete });
        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox').closest('div'));
            vi.advanceTimersByTime(500);
        });
        expect(onComplete).toHaveBeenCalled();
    });

    it('does not throw when onComplete is not provided and the task is clicked', () => {
        renderTaskItem();
        expect(() => {
            fireEvent.click(screen.getByRole('checkbox').closest('div'));
            act(() => vi.advanceTimersByTime(500));
        }).not.toThrow();
    });

    it('does not call onComplete or playDing when the checkbox is already checked', async () => {
        const onComplete = vi.fn();
        renderTaskItem({ onComplete });
        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox').closest('div'));
            vi.advanceTimersByTime(500);
        });
        onComplete.mockClear();
        playDingModule.default.mockClear();
        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox').closest('div'));
            vi.advanceTimersByTime(500);
        });
        expect(onComplete).not.toHaveBeenCalled();
        expect(playDingModule.default).not.toHaveBeenCalled();
    });

    it('does not call onComplete or playDing when completed is true', async () => {
        const onComplete = vi.fn();
        renderTaskItem({ onComplete, completed: true });
        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox').closest('div'));
            vi.advanceTimersByTime(500);
        });
        expect(onComplete).not.toHaveBeenCalled();
        expect(playDingModule.default).not.toHaveBeenCalled();
    });

    it('renders the PinButton when onPin is provided', () => {
        renderTaskItem({ onPin: vi.fn() });
        expect(screen.getByTestId('pin-button')).toBeInTheDocument();
    });

    it('renders the PinButton when onUnpin is provided', () => {
        renderTaskItem({ onUnpin: vi.fn() });
        expect(screen.getByTestId('pin-button')).toBeInTheDocument();
    });

    it('does not render the PinButton when neither onPin nor onUnpin is provided', () => {
        renderTaskItem();
        expect(screen.queryByTestId('pin-button')).not.toBeInTheDocument();
    });

    it('renders the TaskOptionsButton', () => {
        renderTaskItem();
        expect(screen.getByTestId('task-options-button')).toBeInTheDocument();
    });

    it('opens the TaskDetailsPopup when onViewDetails is called', () => {
        renderTaskItem();
        fireEvent.click(screen.getByText('View Details'));
        expect(screen.getByTestId('task-details-popup')).toBeInTheDocument();
    });

    it('closes the TaskDetailsPopup when the close button is clicked', () => {
        renderTaskItem();
        fireEvent.click(screen.getByText('View Details'));
        fireEvent.click(screen.getByText('Close Details'));
        expect(screen.queryByTestId('task-details-popup')).not.toBeInTheDocument();
    });
});