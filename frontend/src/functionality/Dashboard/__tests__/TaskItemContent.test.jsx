import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItemContent from '../TaskItemContent.jsx';

vi.mock('../stylesheets/TaskItemContent.css', () => ({}));
vi.mock('../../../utils/Formatters/formatDateTime.js', () => ({
    default: vi.fn(() => '09:00 - 10:00 18 Mar')
}));

import formatDateTime from '../../../utils/Formatters/formatDateTime.js';

const defaultProps = {
    name: 'Finish coursework',
    date: '2026-03-18',
    startTime: '09:00',
    endTime: '10:00',
    checked: false,
    fading: false,
    overdue: false,
    completed: false,
    onClick: vi.fn(),
};

const renderContent = (props = {}) =>
    render(<TaskItemContent {...defaultProps} {...props} />);

describe('TaskItemContent component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the task name', () => {
        renderContent();
        expect(screen.getByText('Finish coursework')).toBeInTheDocument();
    });

    it('renders the formatted date and time', () => {
        renderContent();
        expect(screen.getByText('09:00 - 10:00 18 Mar')).toBeInTheDocument();
    });

    it('renders the checkbox as unchecked by default', () => {
        renderContent();
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders the checkbox as checked when checked is true', () => {
        renderContent({ checked: true });
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('applies the checked class when checked is true', () => {
        renderContent({ checked: true });
        expect(screen.getByRole('checkbox').closest('div')).toHaveClass('checked');
    });

    it('does not apply the checked class when checked is false', () => {
        renderContent();
        expect(screen.getByRole('checkbox').closest('div')).not.toHaveClass('checked');
    });

    it('applies the fading class when fading is true', () => {
        renderContent({ fading: true });
        expect(screen.getByRole('checkbox').closest('div')).toHaveClass('fading');
    });

    it('does not apply the fading class when fading is false', () => {
        renderContent();
        expect(screen.getByRole('checkbox').closest('div')).not.toHaveClass('fading');
    });

    it('applies the overdue-text class when overdue is true', () => {
        renderContent({ overdue: true });
        expect(screen.getByText('Finish coursework')).toHaveClass('overdue-text');
    });

    it('does not apply the overdue-text class when overdue is false', () => {
        renderContent();
        expect(screen.getByText('Finish coursework')).not.toHaveClass('overdue-text');
    });

    it('applies the completed-text class when completed is true', () => {
        renderContent({ completed: true });
        expect(screen.getByText('Finish coursework')).toHaveClass('completed-text');
    });

    it('does not apply the completed-text class when completed is false', () => {
        renderContent();
        expect(screen.getByText('Finish coursework')).not.toHaveClass('completed-text');
    });

    it('calls onClick when the task item is clicked', () => {
        const onClick = vi.fn();
        renderContent({ onClick });
        fireEvent.click(screen.getByRole('checkbox').closest('div'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls formatDateTime with the correct arguments', () => {
        renderContent();
        expect(formatDateTime).toHaveBeenCalledWith('2026-03-18', '09:00', '10:00');
    });
});