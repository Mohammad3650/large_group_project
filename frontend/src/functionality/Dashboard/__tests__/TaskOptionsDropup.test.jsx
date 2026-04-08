import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TaskOptionsDropup from '../TaskOptionsDropup.jsx';

vi.mock('../stylesheets/TaskOptionsDropup.css', () => ({}));
vi.mock('react-icons/fa', () => ({
    FaEye: () => <svg data-testid="icon-eye" />,
    FaEdit: () => <svg data-testid="icon-edit" />,
    FaUndo: () => <svg data-testid="icon-undo" />,
    FaTrash: () => <svg data-testid="icon-trash" />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

const defaultProps = {
    id: 1,
    completed: false,
    setDropdownOpen: vi.fn(),
    onDelete: vi.fn(),
    onUndoComplete: vi.fn(),
    onViewDetails: vi.fn(),
};

const renderDropup = (props = {}) =>
    render(
        <MemoryRouter>
            <TaskOptionsDropup {...defaultProps} {...props} />
        </MemoryRouter>
    );

describe('TaskOptionsDropup component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.confirm = vi.fn();
    });

    it('renders the view details button', () => {
        renderDropup();
        expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    it('renders the edit button', () => {
        renderDropup();
        expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('renders the delete button', () => {
        renderDropup();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('does not render the undo completion button when completed is false', () => {
        renderDropup();
        expect(screen.queryByText('Undo Completion')).not.toBeInTheDocument();
    });

    it('renders the undo completion button when completed is true', () => {
        renderDropup({ completed: true });
        expect(screen.getByText('Undo Completion')).toBeInTheDocument();
    });

    it('calls onViewDetails and closes the menu when view details is clicked', () => {
        const setDropdownOpen = vi.fn();
        const onViewDetails = vi.fn();
        renderDropup({ setDropdownOpen, onViewDetails });
        fireEvent.click(screen.getByText('View Details'));
        expect(onViewDetails).toHaveBeenCalledTimes(1);
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
    });

    it('stops propagation when view details is clicked', () => {
        const parentHandler = vi.fn();
        render(
            <MemoryRouter>
                <div onClick={parentHandler}>
                    <TaskOptionsDropup {...defaultProps} />
                </div>
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText('View Details'));
        expect(parentHandler).not.toHaveBeenCalled();
    });

    it('navigates to the edit page and closes the menu when edit is clicked', () => {
        const setDropdownOpen = vi.fn();
        renderDropup({ setDropdownOpen });
        fireEvent.click(screen.getByText('Edit'));
        expect(mockNavigate).toHaveBeenCalledWith('/timeblocks/1/edit');
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
    });

    it('stops propagation when edit is clicked', () => {
        const parentHandler = vi.fn();
        render(
            <MemoryRouter>
                <div onClick={parentHandler}>
                    <TaskOptionsDropup {...defaultProps} />
                </div>
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText('Edit'));
        expect(parentHandler).not.toHaveBeenCalled();
    });

    it('calls onDelete and closes the menu when delete is confirmed', () => {
        global.confirm.mockReturnValue(true);
        const setDropdownOpen = vi.fn();
        const onDelete = vi.fn();
        renderDropup({ setDropdownOpen, onDelete });
        fireEvent.click(screen.getByText('Delete'));
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
    });

    it('does not call onDelete when delete is cancelled', () => {
        global.confirm.mockReturnValue(false);
        const onDelete = vi.fn();
        const setDropdownOpen = vi.fn();
        renderDropup({ onDelete, setDropdownOpen });
        fireEvent.click(screen.getByText('Delete'));
        expect(onDelete).not.toHaveBeenCalled();
        expect(setDropdownOpen).not.toHaveBeenCalled();
    });

    it('stops propagation when delete is clicked', () => {
        global.confirm.mockReturnValue(false);
        const parentHandler = vi.fn();
        render(
            <MemoryRouter>
                <div onClick={parentHandler}>
                    <TaskOptionsDropup {...defaultProps} />
                </div>
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText('Delete'));
        expect(parentHandler).not.toHaveBeenCalled();
    });

    it('calls onUndoComplete and closes the menu when undo completion is clicked', () => {
        const setDropdownOpen = vi.fn();
        const onUndoComplete = vi.fn();
        renderDropup({ completed: true, setDropdownOpen, onUndoComplete });
        fireEvent.click(screen.getByText('Undo Completion'));
        expect(onUndoComplete).toHaveBeenCalledTimes(1);
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
    });

    it('stops propagation when undo completion is clicked', () => {
        const parentHandler = vi.fn();
        render(
            <MemoryRouter>
                <div onClick={parentHandler}>
                    <TaskOptionsDropup {...defaultProps} completed={true} />
                </div>
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText('Undo Completion'));
        expect(parentHandler).not.toHaveBeenCalled();
    });

    it('renders all icons', () => {
        renderDropup({ completed: true });
        expect(screen.getByTestId('icon-eye')).toBeInTheDocument();
        expect(screen.getByTestId('icon-edit')).toBeInTheDocument();
        expect(screen.getByTestId('icon-undo')).toBeInTheDocument();
        expect(screen.getByTestId('icon-trash')).toBeInTheDocument();
    });
});