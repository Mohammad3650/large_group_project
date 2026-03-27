import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockNavigate, mockUseTimeBlocks, mockUseUsername, mockHandleDelete } =
    vi.hoisted(() => ({
        mockNavigate: vi.fn(),
        mockUseTimeBlocks: vi.fn(),
        mockUseUsername: vi.fn(),
        mockHandleDelete: vi.fn()
    }));

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../../../utils/useTimeBlocks.js', () => ({
    default: mockUseTimeBlocks
}));

vi.mock('../../../utils/useUsername.js', () => ({
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
            <button onClick={() => setBlocks(['updated'])}>
                Trigger Set Blocks
            </button>
            <div>{headerButtons}</div>
            <div>{eventButtons({ id: 42 }, mockHandleDelete)}</div>
        </div>
    )
}));

import Calendar from '../Calendar';

describe('Calendar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockedUsername = {
        username: 'Mohammad',
        toString: () => 'Mohammad'
    };

    it('renders the placeholder when blocks are null', () => {
        mockUseTimeBlocks.mockReturnValue({
            blocks: null,
            setBlocks: vi.fn()
        });
        mockUseUsername.mockReturnValue(mockedUsername);

        render(<Calendar />);

        expect(
            screen.getByText('Mock Calendar Placeholder')
        ).toBeInTheDocument();
    });

    it('renders the calendar view with the correct props', () => {
        const setBlocks = vi.fn();

        mockUseTimeBlocks.mockReturnValue({
            blocks: [{ id: 1 }, { id: 2 }],
            setBlocks
        });
        mockUseUsername.mockReturnValue(mockedUsername);

        render(<Calendar />);

        expect(screen.getByText('Mock Calendar View')).toBeInTheDocument();
        expect(
            screen.getByText('Welcome to your calendar, Mohammad!')
        ).toBeInTheDocument();
        expect(screen.getByTestId('blocks-length')).toHaveTextContent('2');
        expect(screen.getByText('Mock Add Task Button')).toBeInTheDocument();
    });

    it('passes true to useUsername', () => {
        mockUseTimeBlocks.mockReturnValue({
            blocks: [{ id: 1 }],
            setBlocks: vi.fn()
        });
        mockUseUsername.mockReturnValue(mockedUsername);

        render(<Calendar />);

        expect(mockUseUsername).toHaveBeenCalledWith(true);
    });

    it('navigates to the edit page when edit is clicked', () => {
        mockUseTimeBlocks.mockReturnValue({
            blocks: [{ id: 1 }],
            setBlocks: vi.fn()
        });
        mockUseUsername.mockReturnValue(mockedUsername);

        render(<Calendar />);

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

        expect(mockNavigate).toHaveBeenCalledWith('/timeblocks/42/edit');
    });

    it('calls delete when delete is clicked', () => {
        mockUseTimeBlocks.mockReturnValue({
            blocks: [{ id: 1 }],
            setBlocks: vi.fn()
        });
        mockUseUsername.mockReturnValue(mockedUsername);

        render(<Calendar />);

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(mockHandleDelete).toHaveBeenCalledWith(42);
    });

    it('passes setBlocks through to CalendarView', () => {
        const setBlocks = vi.fn();

        mockUseTimeBlocks.mockReturnValue({
            blocks: [{ id: 1 }],
            setBlocks
        });
        mockUseUsername.mockReturnValue(mockedUsername);

        render(<Calendar />);

        fireEvent.click(
            screen.getByRole('button', { name: 'Trigger Set Blocks' })
        );

        expect(setBlocks).toHaveBeenCalledWith(['updated']);
    });
});
