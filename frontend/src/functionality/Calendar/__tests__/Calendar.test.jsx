import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockUseTimeBlocks, mockUseUsername, mockRenderEventActions } = vi.hoisted(() => ({
    mockUseTimeBlocks: vi.fn(),
    mockUseUsername: vi.fn(),
    mockRenderEventActions: vi.fn()
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

vi.mock('../RenderEventActions.jsx', () => ({
    default: (...args) => mockRenderEventActions(...args)
}));

vi.mock('../CalendarView.jsx', () => ({
    default: ({ blocks, setBlocks, username, headerButtons, eventButtons }) => (
        <div>
            <div>Mock Calendar View</div>
            <div data-testid="blocks-length">{blocks.length}</div>
            <div data-testid="username">{username}</div>
            <button onClick={() => setBlocks(['updated'])}>Trigger Set Blocks</button>
            <div>{headerButtons}</div>
            <button onClick={() => eventButtons({ id: 42 }, 'mock-delete-handler')}>
                Trigger Event Buttons
            </button>
        </div>
    )
}));

import Calendar from '../Calendar.jsx';

function renderCalendar({ blocks = [{ id: 1 }], setBlocks = vi.fn(), username = 'Mohammad' } = {}) {
    mockUseTimeBlocks.mockReturnValue({
        blocks,
        setBlocks
    });

    mockUseUsername.mockReturnValue({
        username
    });

    return {
        setBlocks,
        ...render(<Calendar />)
    };
}

describe('Calendar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when blocks are null', () => {
        const { container } = renderCalendar({ blocks: null });

        expect(container).toBeEmptyDOMElement();
    });

    it('renders the calendar view when there are no events', () => {
        renderCalendar({ blocks: [] });

        expect(screen.getByText('Mock Calendar View')).toBeInTheDocument();
        expect(screen.getByTestId('blocks-length')).toHaveTextContent('0');
    });

    it('renders the calendar view with the correct props', () => {
        renderCalendar({ blocks: [{ id: 1 }, { id: 2 }] });

        expect(screen.getByText('Mock Calendar View')).toBeInTheDocument();
        expect(screen.getByTestId('blocks-length')).toHaveTextContent('2');
        expect(screen.getByTestId('username')).toHaveTextContent('Mohammad');
        expect(screen.getByText('Mock Add Task Button')).toBeInTheDocument();
    });

    it('passes true to useUsername', () => {
        renderCalendar();

        expect(mockUseUsername).toHaveBeenCalledWith(true);
    });

    it('passes setBlocks through to CalendarView', () => {
        const { setBlocks } = renderCalendar();

        fireEvent.click(screen.getByRole('button', { name: 'Trigger Set Blocks' }));

        expect(setBlocks).toHaveBeenCalledWith(['updated']);
    });

    it('passes RenderEventActions to CalendarView and calls it', () => {
        renderCalendar();

        fireEvent.click(screen.getByRole('button', { name: 'Trigger Event Buttons' }));

        expect(mockRenderEventActions).toHaveBeenCalledTimes(1);
        expect(mockRenderEventActions).toHaveBeenCalledWith({ id: 42 }, 'mock-delete-handler');
    });
});
