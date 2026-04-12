import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskOptionsButton from '../../TaskOptionsDropup/TaskOptionsButton.jsx';

vi.mock('../../utils/Hooks/useTaskOptionsButton.js', () => ({ default: vi.fn() }));
vi.mock('../../stylesheets/TaskOptionsDropup/TaskOptionsButton.css', () => ({}));
vi.mock('../../TaskOptionsDropup/TaskOptionsDropup.jsx', () => ({
    default: ({ onDelete, onUndoComplete, onViewDetails }) => (
        <div data-testid="task-options-dropup">
            <button onClick={onDelete}>Delete</button>
            {onUndoComplete && <button onClick={onUndoComplete}>Undo</button>}
            <button onClick={onViewDetails}>View Details</button>
        </div>
    ),
}));

import * as useTaskOptionsButtonModule from '../../utils/Hooks/useTaskOptionsButton.js';

const mockSetDropdownOpen = vi.fn();
const mockHandleOptionsClick = vi.fn();

const defaultHookReturn = {
    dropdownOpen: false,
    setDropdownOpen: mockSetDropdownOpen,
    dropdownRef: { current: null },
    handleOptionsClick: mockHandleOptionsClick,
};

const defaultProps = {
    id: 1,
    completed: false,
    onDelete: vi.fn(),
    onViewDetails: vi.fn(),
};

const renderTaskOptionsButton = (props = {}) =>
    render(<TaskOptionsButton {...defaultProps} {...props} />);

describe('TaskOptionsButton component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useTaskOptionsButtonModule.default.mockReturnValue(defaultHookReturn);
    });

    it('renders the options button', () => {
        renderTaskOptionsButton();
        expect(screen.getByText('⋮')).toBeInTheDocument();
    });

    it('does not render the dropup by default', () => {
        renderTaskOptionsButton();
        expect(screen.queryByTestId('task-options-dropup')).not.toBeInTheDocument();
    });

    it('renders the dropup when dropdownOpen is true', () => {
        useTaskOptionsButtonModule.default.mockReturnValue({ ...defaultHookReturn, dropdownOpen: true });
        renderTaskOptionsButton();
        expect(screen.getByTestId('task-options-dropup')).toBeInTheDocument();
    });

    it('calls handleOptionsClick when the options button is clicked', () => {
        renderTaskOptionsButton();
        fireEvent.click(screen.getByText('⋮'));
        expect(mockHandleOptionsClick).toHaveBeenCalledOnce();
    });

    it('calls onDelete from the dropup when the dropup is open', () => {
        const onDelete = vi.fn();
        useTaskOptionsButtonModule.default.mockReturnValue({ ...defaultHookReturn, dropdownOpen: true });
        renderTaskOptionsButton({ onDelete });
        fireEvent.click(screen.getByText('Delete'));
        expect(onDelete).toHaveBeenCalled();
    });

    it('calls onViewDetails from the dropup when the dropup is open', () => {
        const onViewDetails = vi.fn();
        useTaskOptionsButtonModule.default.mockReturnValue({ ...defaultHookReturn, dropdownOpen: true });
        renderTaskOptionsButton({ onViewDetails });
        fireEvent.click(screen.getByText('View Details'));
        expect(onViewDetails).toHaveBeenCalled();
    });

    it('calls onUndoComplete from the dropup when provided and dropup is open', () => {
        const onUndoComplete = vi.fn();
        useTaskOptionsButtonModule.default.mockReturnValue({ ...defaultHookReturn, dropdownOpen: true });
        renderTaskOptionsButton({ onUndoComplete });
        fireEvent.click(screen.getByText('Undo'));
        expect(onUndoComplete).toHaveBeenCalled();
    });

    it('does not render the undo button when onUndoComplete is not provided', () => {
        useTaskOptionsButtonModule.default.mockReturnValue({ ...defaultHookReturn, dropdownOpen: true });
        renderTaskOptionsButton();
        expect(screen.queryByText('Undo')).not.toBeInTheDocument();
    });
});