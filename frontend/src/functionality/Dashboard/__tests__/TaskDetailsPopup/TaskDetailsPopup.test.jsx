import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskDetailsPopup from '../../TaskDetailsPopup/TaskDetailsPopup.jsx';

vi.mock('../stylesheets/TaskDetailsPopup.css', () => ({}));
vi.mock('../../../utils/Formatters/formatDateTime.js', () => ({
    default: vi.fn(() => '09:00 - 10:00 18 Mar')
}));
vi.mock('react-icons/fa', () => ({
    FaClock: () => <svg data-testid="icon-clock" />,
    FaMapMarkerAlt: () => <svg data-testid="icon-location" />,
    FaTag: () => <svg data-testid="icon-tag" />,
    FaAlignLeft: () => <svg data-testid="icon-description" />,
    FaTimes: () => <svg data-testid="icon-close" />,
}));

const mockTask = {
    id: 1,
    name: 'Finish coursework',
    date: '2026-03-18',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Room 101',
    blockType: 'Lecture',
    description: 'Introduction to testing',
};

const renderPopup = (props = {}) =>
    render(<TaskDetailsPopup task={mockTask} onClose={vi.fn()} {...props} />);

describe('TaskDetailsPopup component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the task name', () => {
        renderPopup();
        expect(screen.getByText('Finish coursework')).toBeInTheDocument();
    });

    it('renders the formatted date and time', () => {
        renderPopup();
        expect(screen.getByText('09:00 - 10:00 18 Mar')).toBeInTheDocument();
    });

    it('renders the task location', () => {
        renderPopup();
        expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    it('renders the fallback when location is not provided', () => {
        renderPopup({ task: { ...mockTask, location: null } });
        expect(screen.getByText('No location')).toBeInTheDocument();
    });

    it('renders the block type', () => {
        renderPopup();
        expect(screen.getByText('Lecture')).toBeInTheDocument();
    });

    it('renders the fallback when blockType is not provided', () => {
        renderPopup({ task: { ...mockTask, blockType: null } });
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('renders the description', () => {
        renderPopup();
        expect(screen.getByText('Introduction to testing')).toBeInTheDocument();
    });

    it('renders the fallback when description is not provided', () => {
        renderPopup({ task: { ...mockTask, description: null } });
        expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('renders all icons', () => {
        renderPopup();
        expect(screen.getByTestId('icon-clock')).toBeInTheDocument();
        expect(screen.getByTestId('icon-location')).toBeInTheDocument();
        expect(screen.getByTestId('icon-tag')).toBeInTheDocument();
        expect(screen.getByTestId('icon-description')).toBeInTheDocument();
        expect(screen.getByTestId('icon-close')).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn();
        renderPopup({ onClose });
        fireEvent.click(screen.getByTestId('icon-close').closest('button'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the overlay is clicked', () => {
        const onClose = vi.fn();
        renderPopup({ onClose });
        fireEvent.click(screen.getByText('Finish coursework').closest('.task-details-overlay'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside the popup', () => {
        const onClose = vi.fn();
        renderPopup({ onClose });
        fireEvent.click(screen.getByText('Finish coursework').closest('.task-details-popup'));
        expect(onClose).not.toHaveBeenCalled();
    });
});