import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskOptionsButton from '../TaskOptionsButton.jsx';

vi.mock('../../../utils/Hooks/useDropdown.js', () => ({ default: vi.fn() }));
vi.mock('../TaskOptionsDropup.jsx', () => ({
    default: ({ onDelete, onUndoComplete, onViewDetails }) => (
        <div data-testid="task-options-dropup">
            <button onClick={onDelete}>Delete</button>
            {onUndoComplete && <button onClick={onUndoComplete}>Undo</button>}
            <button onClick={onViewDetails}>View Details</button>
        </div>
    ),
}));

import * as useDropdownModule from '../../../utils/Hooks/useDropdown.js';

const mockSetDropdownOpen = vi.fn();

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
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: false,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
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
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: true,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderTaskOptionsButton();
        expect(screen.getByTestId('task-options-dropup')).toBeInTheDocument();
    });

    it('calls setDropdownOpen with a toggle function when the options button is clicked', () => {
        const localSetDropdownOpen = vi.fn();
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: false,
            setDropdownOpen: localSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderTaskOptionsButton();
        fireEvent.click(screen.getByText('⋮'));
        expect(localSetDropdownOpen).toHaveBeenCalledOnce();
        const toggleFn = localSetDropdownOpen.mock.calls[0][0];
        expect(toggleFn(false)).toBe(true);
        expect(toggleFn(true)).toBe(false);
    });

    it('stops event propagation when the options button is clicked', () => {
        const parentHandler = vi.fn();
        render(
            <div onClick={parentHandler}>
                <TaskOptionsButton {...defaultProps} />
            </div>
        );
        fireEvent.click(screen.getByText('⋮'));
        expect(parentHandler).not.toHaveBeenCalled();
    });

    it('calls onDelete when the delete button in the dropup is clicked', () => {
        const onDelete = vi.fn();
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: true,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderTaskOptionsButton({ onDelete });
        fireEvent.click(screen.getByText('Delete'));
        expect(onDelete).toHaveBeenCalled();
    });

    it('calls onUndoComplete when the undo button in the dropup is clicked', () => {
        const onUndoComplete = vi.fn();
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: true,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderTaskOptionsButton({ onUndoComplete });
        fireEvent.click(screen.getByText('Undo'));
        expect(onUndoComplete).toHaveBeenCalled();
    });

    it('calls onViewDetails when the view details button in the dropup is clicked', () => {
        const onViewDetails = vi.fn();
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: true,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderTaskOptionsButton({ onViewDetails });
        fireEvent.click(screen.getByText('View Details'));
        expect(onViewDetails).toHaveBeenCalled();
    });

    it('does not render the undo button when onUndoComplete is not provided', () => {
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: true,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: { current: null },
        });
        renderTaskOptionsButton();
        expect(screen.queryByText('Undo')).not.toBeInTheDocument();
    });
});