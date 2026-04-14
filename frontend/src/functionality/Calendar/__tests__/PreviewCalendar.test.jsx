import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockNavigate, mockHandleDelete, mockMapTimeBlocks, mockSavePlan } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockHandleDelete: vi.fn(),
    mockMapTimeBlocks: vi.fn(),
    mockSavePlan: vi.fn()
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../../../utils/Helpers/mapTimeBlocks.js', () => ({
    default: mockMapTimeBlocks
}));

vi.mock('../CalendarView.jsx', () => ({
    default: ({ blocks, setBlocks, title, headerButtons, eventButtons }) => (
        <div>
            <div>Mock Calendar View</div>
            <div>{title}</div>
            <div data-testid="blocks-length">{blocks.length}</div>
            <button onClick={() => setBlocks(['updated'])}>Trigger Set Blocks</button>
            <div>{headerButtons}</div>
            <div>{eventButtons ? eventButtons({ id: 42 }, mockHandleDelete) : null}</div>
        </div>
    )
}));

vi.mock('../utils/Api/savePlan.js', () => ({
    default: mockSavePlan
}));

import PreviewCalendar from '../PreviewCalendar';

describe('Tests for PreviewCalendar', () => {
    const mockSchedule = {
        week_start: '2026-03-16',
        events: [
            {
                id: 1,
                name: 'Study Session',
                date: '2026-03-16',
                start_time: '09:00:00',
                end_time: '10:00:00',
                timezone: 'Europe/London'
            }
        ],
        scheduled: [
            {
                id: 2,
                name: 'Lecture',
                date: '2026-03-16',
                start_time: '10:00:00',
                end_time: '11:00:00',
                timezone: 'Europe/London'
            }
        ]
    };

    const mappedBlocks = [
        { id: 'block-1', title: 'Study Session' },
        { id: 'block-2', title: 'Lecture' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    it('renders nothing when blocks are null', () => {
        const { container } = render(<PreviewCalendar />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders save and cancel buttons once CalendarView is shown', async () => {
        sessionStorage.setItem('generatedSchedule', JSON.stringify(mockSchedule));
        mockMapTimeBlocks.mockReturnValue(mappedBlocks);

        render(<PreviewCalendar />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Save Schedule/i })).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('loads schedule from sessionStorage and renders CalendarView', async () => {
        sessionStorage.setItem('generatedSchedule', JSON.stringify(mockSchedule));
        mockMapTimeBlocks.mockReturnValue(mappedBlocks);

        render(<PreviewCalendar />);

        await waitFor(() => {
            expect(screen.getByText('Preview generated schedule')).toBeInTheDocument();
        });

        expect(mockMapTimeBlocks).toHaveBeenCalledWith([
            ...mockSchedule.events,
            ...mockSchedule.scheduled
        ]);

        expect(screen.getByTestId('blocks-length')).toHaveTextContent(String(mappedBlocks.length));
    });

    it('saves schedule and navigates to dashboard', async () => {
        sessionStorage.setItem('generatedSchedule', JSON.stringify(mockSchedule));
        mockMapTimeBlocks.mockReturnValue(mappedBlocks);
        mockSavePlan.mockResolvedValue({});

        render(<PreviewCalendar />);

        await waitFor(() => {
            expect(screen.getByText('Save Schedule')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Save Schedule'));

        await waitFor(() => {
            expect(mockSavePlan).toHaveBeenCalledWith({
                week_start: mockSchedule.week_start,
                events: mockSchedule.events
            });
        });

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('removes generatedSchedule and navigates on cancel', async () => {
        sessionStorage.setItem('generatedSchedule', JSON.stringify(mockSchedule));
        mockMapTimeBlocks.mockReturnValue(mappedBlocks);

        render(<PreviewCalendar />);

        await waitFor(() => {
            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Cancel'));

        expect(sessionStorage.getItem('generatedSchedule')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
});

it('logs an error when loading the generated schedule fails', async () => {
    const error = new Error('Bad session data');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    sessionStorage.setItem('generatedSchedule', '{invalid json');

    render(<PreviewCalendar />);

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load time blocks', expect.any(Error));
    });

    consoleSpy.mockRestore();
});
