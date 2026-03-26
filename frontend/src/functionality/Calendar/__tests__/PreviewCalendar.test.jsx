import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockNavigate, mockHandleDelete, mockMapTimeBlocks, mockSavePlan } =
    vi.hoisted(() => ({
        mockNavigate: vi.fn(),
        mockHandleDelete: vi.fn(),
        mockMapTimeBlocks: vi.fn(),
        mockSavePlan: vi.fn()
    }));

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../CalendarPlaceholder.jsx', () => ({
    default: () => <div>Mock Calendar Placeholder</div>
}));

vi.mock('../../../utils/mapTimeBlocks.js', () => ({
    default: mockMapTimeBlocks
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
            <div>
                {eventButtons
                    ? eventButtons({ id: 42 }, mockHandleDelete)
                    : null}
            </div>
        </div>
    )
}));

vi.mock('../../../utils/savePlan.js', () => ({
    default: mockSavePlan
}));

import PreviewCalendar from '../PreviewCalendar';

describe('PreviewCalendar', () => {
    const mockSchedule = {
        week_start: '2026-03-16',
        events: [
            {
                id: 1,
                name: 'Study Session',
                date: '2026-03-16',
                start_time: '09:00',
                end_time: '10:00'
            }
        ],
        scheduled: [
            {
                id: 2,
                name: 'Lecture',
                date: '2026-03-16',
                start_time: '10:00',
                end_time: '11:00'
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

    it('renders the placeholder when blocks are null', () => {
        render(<PreviewCalendar />);

        expect(
            screen.getByText('Mock Calendar Placeholder')
        ).toBeInTheDocument();
    });

    it('renders save and cancel buttons once CalendarView is shown', async () => {
        sessionStorage.setItem(
            'generatedSchedule',
            JSON.stringify(mockSchedule)
        );
        mockMapTimeBlocks.mockReturnValue(mappedBlocks);

        render(<PreviewCalendar />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /Save Schedule/i })
            ).toBeInTheDocument();
        });
        expect(
            screen.getByRole('button', { name: /Cancel/i })
        ).toBeInTheDocument();
    });

    it('loads schedule from sessionStorage and renders CalendarView', async () => {
        sessionStorage.setItem(
            'generatedSchedule',
            JSON.stringify(mockSchedule)
        );
        mockMapTimeBlocks.mockReturnValue(mappedBlocks);

        render(<PreviewCalendar />);

        await waitFor(() => {
            expect(
                screen.getByText('Preview generated schedule')
            ).toBeInTheDocument();
        });

        expect(mockMapTimeBlocks).toHaveBeenCalledWith([
            ...mockSchedule.events,
            ...mockSchedule.scheduled
        ]);

        expect(screen.getByTestId('blocks-length')).toHaveTextContent(
            String(mappedBlocks.length)
        );
    });

    it('saves schedule and navigates to dashboard', async () => {
        sessionStorage.setItem(
            'generatedSchedule',
            JSON.stringify(mockSchedule)
        );
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
                events: mockSchedule.events,
                timezone: expect.any(String)
            });
        });

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('removes generatedSchedule and navigates on cancel', async () => {
        sessionStorage.setItem(
            'generatedSchedule',
            JSON.stringify(mockSchedule)
        );
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
