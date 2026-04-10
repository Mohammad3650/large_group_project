import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoTasksMessage from '../../TaskSection/NoTasksMessage.jsx';

vi.mock('../stylesheets/NoTasksMessage.css', () => ({}));
vi.mock('../../../utils/Helpers/getNoSearchResults.js', () => ({ default: vi.fn() }));

import * as getNoSearchResultsModule from '../../utils/Helpers/getNoSearchResults.js';

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
    beforeEach(() => {
        vi.clearAllMocks();
        getNoSearchResultsModule.default.mockReturnValue(false);
    });

    it('renders the congratulatory message when totalTasks is zero', () => {
        render(<NoTasksMessage totalTasks={0} filteredTasks={emptyFilteredTasks} searchTerm="" />);
        expect(screen.getByText('🎉 Congrats, you have no tasks!')).toBeInTheDocument();
    });

    it('renders null when totalTasks is greater than zero and getNoSearchResults returns false', () => {
        const { container } = render(
            <NoTasksMessage totalTasks={3} filteredTasks={emptyFilteredTasks} searchTerm="" />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders the no results message when getNoSearchResults returns true', () => {
        getNoSearchResultsModule.default.mockReturnValue(true);
        render(<NoTasksMessage totalTasks={3} filteredTasks={emptyFilteredTasks} searchTerm="lecture" />);
        expect(screen.getByText('No tasks found matching "lecture"')).toBeInTheDocument();
    });

    it('trims the searchTerm in the no results message', () => {
        getNoSearchResultsModule.default.mockReturnValue(true);
        render(<NoTasksMessage totalTasks={3} filteredTasks={emptyFilteredTasks} searchTerm="  lecture  " />);
        expect(screen.getByText('No tasks found matching "lecture"')).toBeInTheDocument();
    });

    it('passes filteredTasks and searchTerm to getNoSearchResults', () => {
        render(<NoTasksMessage totalTasks={3} filteredTasks={emptyFilteredTasks} searchTerm="test" />);
        expect(getNoSearchResultsModule.default).toHaveBeenCalledWith(emptyFilteredTasks, 'test');
    });
});