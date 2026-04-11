import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskGroupHeader from '../../TaskSection/TaskGroupHeader.jsx';

vi.mock('../../utils/Helpers/getTitleClass.js', () => ({ default: vi.fn() }));
vi.mock('../../stylesheets/TaskSection/TaskGroupHeader.css', () => ({}));

import * as getTitleClassModule from '../../utils/Helpers/getTitleClass.js';

const defaultProps = {
    isOpen: true,
    onToggle: vi.fn(),
    title: 'Today',
    variant: 'today',
    taskCount: 3,
};

const renderHeader = (props = {}) =>
    render(<TaskGroupHeader {...defaultProps} {...props} />);

describe('TaskGroupHeader component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getTitleClassModule.default.mockReturnValue('');
    });

    it('renders the title', () => {
        renderHeader();
        expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('renders the task count', () => {
        renderHeader();
        expect(screen.getByText('(3)')).toBeInTheDocument();
    });

    it('renders the arrow with the "open" class when isOpen is true', () => {
        renderHeader({ isOpen: true });
        expect(screen.getByText('^')).toHaveClass('open');
    });

    it('renders the arrow with the "closed" class when isOpen is false', () => {
        renderHeader({ isOpen: false });
        expect(screen.getByText('^')).toHaveClass('closed');
    });

    it('calls onToggle when the header is clicked', () => {
        const onToggle = vi.fn();
        renderHeader({ onToggle });
        fireEvent.click(screen.getByTestId('task-group-header'));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('applies the class returned by getTitleClass to the title', () => {
        getTitleClassModule.default.mockReturnValue('overdue-title');
        renderHeader({ variant: 'overdue', title: 'Overdue' });
        expect(screen.getByText('Overdue')).toHaveClass('overdue-title');
    });

    it('calls getTitleClass with the variant prop', () => {
        renderHeader({ variant: 'completed' });
        expect(getTitleClassModule.default).toHaveBeenCalledWith('completed');
    });

    it('has the task-group-header data-testid', () => {
        renderHeader();
        expect(screen.getByTestId('task-group-header')).toBeInTheDocument();
    });
});