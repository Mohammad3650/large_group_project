import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskDetailsHeader from '../../TaskDetailsPopup/TaskDetailsHeader.jsx';

vi.mock('../../stylesheets/TaskDetailsPopup/TaskDetailsHeader.css', () => ({}));
vi.mock('react-icons/fa', () => ({
    FaTimes: () => <svg data-testid="close-icon" />,
}));

describe('TaskDetailsHeader component', () => {
    it('renders the task name', () => {
        render(<TaskDetailsHeader name="Finish coursework" onClose={vi.fn()} />);
        expect(screen.getByText('Finish coursework')).toBeInTheDocument();
    });

    it('renders the task name in a heading', () => {
        render(<TaskDetailsHeader name="Finish coursework" onClose={vi.fn()} />);
        expect(screen.getByRole('heading', { name: 'Finish coursework' })).toBeInTheDocument();
    });

    it('renders the close icon', () => {
        render(<TaskDetailsHeader name="Task" onClose={vi.fn()} />);
        expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn();
        render(<TaskDetailsHeader name="Task" onClose={onClose} />);
        fireEvent.click(screen.getByTestId('close-icon').closest('button'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});