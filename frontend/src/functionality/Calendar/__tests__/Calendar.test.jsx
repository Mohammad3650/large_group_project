import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockNavigate, mockUseTimeBlocks, mockUseUsername, mockHandleDelete } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockUseTimeBlocks: vi.fn(),
    mockUseUsername: vi.fn(),
    mockHandleDelete: vi.fn()
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../../../utils/Hooks/useTimeBlocks.js', () => ({
    default: mockUseTimeBlocks
}));

vi.mock('../../../utils/Hooks/useUsername.js', () => ({
    default: mockUseUsername
}));

vi.mock('../../../components/AddTaskButton.jsx', () => ({
    default: () => <div>Mock Add Task Button</div>
}));

vi.mock('../CalendarPlaceholder.jsx', () => ({
    default: () => <div>Mock Calendar Placeholder</div>
}));

vi.mock('../CalendarView.jsx', () => ({
    default: ({ blocks, setBlocks, title, headerButtons, eventButtons }) => (
        <div>
            <div>Mock Calendar View</div>
            <div>{title}</div>
            <div data-testid="blocks-length">{blocks.length}</div>
            <button onClick={() => setBlocks(['updated'])}>Trigger Set Blocks</button>
            <div>{headerButtons}</div>
            <div>{eventButtons({ id: 42 }, mockHandleDelete)}</div>
        </div>
    )
}));

import Calendar from '../Calendar';

const mockedUsername = {
    username: 'Mohammad',
    toString: () => 'Mohammad'
};

function renderCalendar({
    blocks = [{ id: 1 }],
    setBlocks = vi.fn(),
    username = mockedUsername
} = {}) {
    mockUseTimeBlocks.mockReturnValue({
        blocks,
        setBlocks
    });
    mockUseUsername.mockReturnValue(username);

    return {
        setBlocks,
        ...render(<Calendar />)
    };
}

describe('Tests for Calendar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the placeholder when blocks are null', () => {
        renderCalendar({ blocks: null });

        expect(screen.getByText('Mock Calendar Placeholder')).toBeInTheDocument();
    });

    it('renders the calendar view with the correct props', () => {
        renderCalendar({ blocks: [{ id: 1 }, { id: 2 }] });

        expect(screen.getByText('Mock Calendar View')).toBeInTheDocument();
        expect(screen.getByTestId('blocks-length')).toHaveTextContent('2');
        expect(screen.getByText('Mock Add Task Button')).toBeInTheDocument();
    });

    it('passes true to useUsername', () => {
        renderCalendar();

        expect(mockUseUsername).toHaveBeenCalledWith(true);
    });

    it('navigates to the edit page when edit is clicked', () => {
        renderCalendar();

        fireEvent.click(screen.getByRole('button', { name: 'Edit event' }));

        expect(mockNavigate).toHaveBeenCalledWith('/timeblocks/42/edit');
    });

    it('calls delete when delete is clicked', () => {
        renderCalendar();

        fireEvent.click(screen.getByRole('button', { name: 'Delete event' }));

        expect(mockHandleDelete).toHaveBeenCalledWith(42);
    });

    it('passes setBlocks through to CalendarView', () => {
        const { setBlocks } = renderCalendar();

        fireEvent.click(screen.getByRole('button', { name: 'Trigger Set Blocks' }));

        expect(setBlocks).toHaveBeenCalledWith(['updated']);
    });
});

it('renders the empty state when there are no events', () => {
    renderCalendar({ blocks: [] });

    expect(screen.getByText('Welcome to your calendar, Mohammad!')).toBeInTheDocument();
    expect(screen.getByText('No events yet.')).toBeInTheDocument();
});
