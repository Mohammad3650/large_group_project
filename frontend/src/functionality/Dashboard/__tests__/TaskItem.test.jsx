import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('../../../assets/Dashboard/ding.mp3', () => ({ default: 'ding.mp3' }));
vi.mock('../stylesheets/TaskItem.css', () => ({}));
vi.mock('../../../utils/Audio/playDing.js', () => ({ default: vi.fn() }));
vi.mock('../../../utils/Formatters/formatDateTime.js', () => ({
    default: vi.fn(() => '09:00 - 10:00 18 Mar')
}));

import TaskItem from '../TaskItem.jsx';
import * as playDingModule from '../../../utils/Audio/playDing.js';

const defaultProps = {
    name: 'Finish coursework',
    date: '2026-03-18',
    startTime: '09:00',
    endTime: '10:00',
    onDelete: vi.fn(),
    overdue: false
};

describe('Tests for TaskItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the task name', () => {
        render(<TaskItem {...defaultProps} />);
        expect(screen.getByText('Finish coursework')).toBeInTheDocument();
    });

    it('renders the formatted date and time', () => {
        render(<TaskItem {...defaultProps} />);
        expect(screen.getByText('09:00 - 10:00 18 Mar')).toBeInTheDocument();
    });

    it('renders the checkbox as unchecked by default', () => {
        render(<TaskItem {...defaultProps} />);
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('applies the overdue-text class to the label when overdue is true', () => {
        render(<TaskItem {...defaultProps} overdue={true} />);
        expect(screen.getByText('Finish coursework')).toHaveClass(
            'overdue-text'
        );
    });

    it('does not apply the overdue-text class when overdue is false', () => {
        render(<TaskItem {...defaultProps} overdue={false} />);
        expect(screen.getByText('Finish coursework')).not.toHaveClass(
            'overdue-text'
        );
    });

    it('checks the checkbox and starts fading when clicked', async () => {
        render(<TaskItem {...defaultProps} />);
        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox').closest('div'));
        });
        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getByRole('checkbox').closest('div')).toHaveClass(
            'fading'
        );
    });

    it('calls playDing when clicked', async () => {
        render(<TaskItem {...defaultProps} />);
        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox').closest('div'));
        });
        expect(playDingModule.default).toHaveBeenCalled();
    });
});
