import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoTasksMessage from '../NoTasksMessage.jsx';

vi.mock('../stylesheets/NoTasksMessage.css', () => ({}));

const emptyFilteredTasks = {
    filteredPinned: [],
    filteredOverdue: [],
    filteredToday: [],
    filteredTomorrow: [],
    filteredWeek: [],
    filteredBeyondWeek: [],
    filteredCompleted: [],
};

describe('NoTasksMessage', () => {
    it('renders the congratulatory message when totalTasks is zero', () => {
        render(<NoTasksMessage totalTasks={0} filteredTasks={emptyFilteredTasks} searchTerm="" />);
        expect(screen.getByText('🎉 Congrats, you have no tasks!')).toBeInTheDocument();
    });

    it('renders null when totalTasks is greater than zero and searchTerm is empty', () => {
        const { container } = render(
            <NoTasksMessage totalTasks={3} filteredTasks={emptyFilteredTasks} searchTerm="" />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders null when totalTasks is greater than zero and searchTerm is only whitespace', () => {
        const { container } = render(
            <NoTasksMessage totalTasks={3} filteredTasks={emptyFilteredTasks} searchTerm="   " />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders the no results message when all filtered groups are empty and searchTerm is non-empty', () => {
        render(<NoTasksMessage totalTasks={3} filteredTasks={emptyFilteredTasks} searchTerm="lecture" />);
        expect(screen.getByText('No tasks found matching "lecture"')).toBeInTheDocument();
    });

    it('trims the searchTerm in the no results message', () => {
        render(<NoTasksMessage totalTasks={3} filteredTasks={emptyFilteredTasks} searchTerm="  lecture  " />);
        expect(screen.getByText('No tasks found matching "lecture"')).toBeInTheDocument();
    });

    it('renders null when searchTerm is non-empty but some filtered tasks exist', () => {
        const { container } = render(
            <NoTasksMessage
                totalTasks={3}
                filteredTasks={{ ...emptyFilteredTasks, filteredToday: [{ id: 1 }] }}
                searchTerm="lecture"
            />
        );
        expect(container.firstChild).toBeNull();
    });
});