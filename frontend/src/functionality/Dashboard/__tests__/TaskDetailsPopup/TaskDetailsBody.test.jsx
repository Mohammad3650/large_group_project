import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskDetailsBody from '../../TaskDetailsPopup/TaskDetailsBody.jsx';

vi.mock('../../stylesheets/TaskDetailsPopup/TaskDetailsBody.css', () => ({}));
vi.mock('../../utils/Formatters/formatDateTime.js', () => ({
    default: vi.fn(() => '09:00 - 10:00 Thu 18 Mar'),
}));
vi.mock('react-icons/fa', () => ({
    FaClock: () => <svg data-testid="icon-clock" />,
    FaMapMarkerAlt: () => <svg data-testid="icon-location" />,
    FaTag: () => <svg data-testid="icon-tag" />,
    FaAlignLeft: () => <svg data-testid="icon-description" />,
}));

import formatDateTime from '../../utils/Formatters/formatDateTime.js';

const mockTask = {
    date: '2026-03-18',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Room 101',
    blockType: 'Lecture',
    description: 'Introduction to testing',
};

describe('TaskDetailsBody component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the formatted date and time', () => {
        render(<TaskDetailsBody task={mockTask} />);
        expect(screen.getByText('09:00 - 10:00 Thu 18 Mar')).toBeInTheDocument();
    });

    it('calls formatDateTime with the correct arguments', () => {
        render(<TaskDetailsBody task={mockTask} />);
        expect(formatDateTime).toHaveBeenCalledWith(mockTask.date, mockTask.startTime, mockTask.endTime);
    });

    it('renders the task location', () => {
        render(<TaskDetailsBody task={mockTask} />);
        expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    it('renders "No location" when location is falsy', () => {
        render(<TaskDetailsBody task={{ ...mockTask, location: null }} />);
        expect(screen.getByText('No location')).toBeInTheDocument();
    });

    it('renders the block type', () => {
        render(<TaskDetailsBody task={mockTask} />);
        expect(screen.getByText('Lecture')).toBeInTheDocument();
    });

    it('renders "N/A" when blockType is falsy', () => {
        render(<TaskDetailsBody task={{ ...mockTask, blockType: null }} />);
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('renders the description', () => {
        render(<TaskDetailsBody task={mockTask} />);
        expect(screen.getByText('Introduction to testing')).toBeInTheDocument();
    });

    it('renders "No description" when description is falsy', () => {
        render(<TaskDetailsBody task={{ ...mockTask, description: null }} />);
        expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('renders all four icons', () => {
        render(<TaskDetailsBody task={mockTask} />);
        expect(screen.getByTestId('icon-clock')).toBeInTheDocument();
        expect(screen.getByTestId('icon-location')).toBeInTheDocument();
        expect(screen.getByTestId('icon-tag')).toBeInTheDocument();
        expect(screen.getByTestId('icon-description')).toBeInTheDocument();
    });
});