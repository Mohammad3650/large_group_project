import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
    mockCreateViewWeek,
    mockCreateViewMonthGrid,
    mockCreateEventModalPlugin,
    mockCreateEventsServicePlugin,
    mockUseCalendarApp,
    mockRemove,
    mockDeleteTimeBlock,
    mockScheduleXCalendar
} = vi.hoisted(() => ({
    mockCreateViewWeek: vi.fn(() => 'week-view'),
    mockCreateViewMonthGrid: vi.fn(() => 'month-view'),
    mockCreateEventModalPlugin: vi.fn(() => 'event-modal-plugin'),
    mockCreateEventsServicePlugin: vi.fn(() => ({
        remove: vi.fn()
    })),
    mockUseCalendarApp: vi.fn(() => 'mock-calendar-app'),
    mockRemove: vi.fn(),
    mockDeleteTimeBlock: vi.fn(),
    mockScheduleXCalendar: vi.fn()
}));

vi.mock('@schedule-x/calendar', () => ({
    createViewWeek: mockCreateViewWeek,
    createViewMonthGrid: mockCreateViewMonthGrid
}));

vi.mock('@schedule-x/event-modal', () => ({
    createEventModalPlugin: mockCreateEventModalPlugin
}));

vi.mock('@schedule-x/events-service', () => ({
    createEventsServicePlugin: () => ({
        remove: mockRemove
    })
}));

vi.mock('@schedule-x/react', () => ({
    useCalendarApp: mockUseCalendarApp,
    ScheduleXCalendar: (props) => {
        mockScheduleXCalendar(props);
        return <div>Mock ScheduleXCalendar</div>;
    }
}));

vi.mock('../../../utils/deleteTimeBlock.js', () => ({
    default: mockDeleteTimeBlock
}));

import CalendarView from '../CalendarView';
import getUserTimezone from '../../../utils/getUserTimezone.js';

describe('CalendarView', () => {
    const blocks = [
        {
            id: 7,
            title: 'Algorithms Lecture',
            date: '2026-02-19',
            startTime: '09:00',
            endTime: '11:00',
            location: 'Bush House',
            blockType: 'Lecture',
            description: 'Graphs and shortest paths'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        global.confirm = vi.fn();
    });

    it('renders the title, header buttons and calendar', () => {
        render(
            <CalendarView
                blocks={blocks}
                setBlocks={vi.fn()}
                title="Welcome to your calendar, Mohammad!"
                headerButtons={<button>Add Task</button>}
            />
        );

        expect(
            screen.getByText('Welcome to your calendar, Mohammad!')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Add Task' })
        ).toBeInTheDocument();
        expect(screen.getByText('Mock ScheduleXCalendar')).toBeInTheDocument();
    });

    it('creates the calendar app with the correct configuration', () => {
        render(
            <CalendarView
                blocks={blocks}
                setBlocks={vi.fn()}
                title="Calendar"
            />
        );

        expect(mockCreateViewWeek).toHaveBeenCalled();
        expect(mockCreateViewMonthGrid).toHaveBeenCalled();
        expect(mockCreateEventModalPlugin).toHaveBeenCalled();
        expect(mockUseCalendarApp).toHaveBeenCalledWith({
            views: ['week-view', 'month-view'],
            plugins: ['event-modal-plugin', { remove: mockRemove }],
            events: blocks,
            selectedDate: Temporal.Now.plainDateISO(),
            timezone: getUserTimezone()
        });
    });

    it('passes customComponents to ScheduleXCalendar and renders the event modal content correctly', () => {
        render(
            <CalendarView
                blocks={blocks}
                setBlocks={vi.fn()}
                title="Calendar"
            />
        );

        expect(mockScheduleXCalendar).toHaveBeenCalled();

        const scheduleProps = mockScheduleXCalendar.mock.calls[0][0];
        expect(scheduleProps.calendarApp).toBe('mock-calendar-app');
        expect(scheduleProps.customComponents).toBeTruthy();

        const EventModal = scheduleProps.customComponents.eventModal;
        const { container } = render(<EventModal calendarEvent={blocks[0]} />);

        expect(screen.getByText('Algorithms Lecture')).toBeInTheDocument();
        expect(screen.getByText('19/02/2026')).toBeInTheDocument();
        expect(screen.getByText('09:00 - 11:00')).toBeInTheDocument();
        expect(screen.getByText('Bush House')).toBeInTheDocument();
        expect(screen.getByText('Lecture')).toBeInTheDocument();
        expect(
            screen.getByText('Graphs and shortest paths')
        ).toBeInTheDocument();

        expect(screen.getByAltText('Date')).toBeInTheDocument();
        expect(screen.getByAltText('Time')).toBeInTheDocument();
        expect(screen.getByAltText('Location')).toBeInTheDocument();
        expect(screen.getByAltText('Block Type')).toBeInTheDocument();
        expect(screen.getByAltText('Description')).toBeInTheDocument();

        expect(
            container.querySelector('.sx__event-modal__title')
        ).toBeInTheDocument();
        expect(
            container.querySelector('.sx__event-modal__description')
        ).toBeInTheDocument();
        expect(container.querySelector('.buttons')).toBeInTheDocument();
    });

    it('renders event buttons when eventButtons is provided and uses the edit button callback', () => {
        const eventButtons = vi.fn((calendarEvent) => (
            <button>Edit {calendarEvent.id}</button>
        ));

        render(
            <CalendarView
                blocks={blocks}
                setBlocks={vi.fn()}
                title="Calendar"
                eventButtons={eventButtons}
            />
        );

        const scheduleProps = mockScheduleXCalendar.mock.calls[0][0];
        const EventModal = scheduleProps.customComponents.eventModal;

        render(<EventModal calendarEvent={blocks[0]} />);

        expect(eventButtons).toHaveBeenCalled();
        expect(
            screen.getByRole('button', { name: 'Edit 7' })
        ).toBeInTheDocument();
    });

    it('renders no event buttons when eventButtons is not provided', () => {
        render(
            <CalendarView
                blocks={blocks}
                setBlocks={vi.fn()}
                title="Calendar"
            />
        );

        const scheduleProps = mockScheduleXCalendar.mock.calls[0][0];
        const EventModal = scheduleProps.customComponents.eventModal;
        const { container } = render(<EventModal calendarEvent={blocks[0]} />);

        expect(container.querySelector('.buttons')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('deletes an event when confirmed', async () => {
        global.confirm.mockReturnValue(true);
        mockDeleteTimeBlock.mockResolvedValue({});
        const setBlocks = vi.fn();

        const eventButtons = (calendarEvent, handleDelete) => (
            <button onClick={() => handleDelete(calendarEvent.id)}>
                Delete
            </button>
        );

        render(
            <CalendarView
                blocks={blocks}
                setBlocks={setBlocks}
                title="Calendar"
                eventButtons={eventButtons}
            />
        );

        const scheduleProps = mockScheduleXCalendar.mock.calls[0][0];
        const EventModal = scheduleProps.customComponents.eventModal;

        render(<EventModal calendarEvent={blocks[0]} />);

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(mockDeleteTimeBlock).toHaveBeenCalledWith(7);
        });

        expect(mockRemove).toHaveBeenCalledWith(7);
        expect(setBlocks).toHaveBeenCalled();

        const updater = setBlocks.mock.calls[0][0];
        expect(updater(blocks)).toEqual([]);
    });

    it('does not delete an event when confirmation is cancelled', () => {
        global.confirm.mockReturnValue(false);
        const setBlocks = vi.fn();

        const eventButtons = (calendarEvent, handleDelete) => (
            <button onClick={() => handleDelete(calendarEvent.id)}>
                Delete
            </button>
        );

        render(
            <CalendarView
                blocks={blocks}
                setBlocks={setBlocks}
                title="Calendar"
                eventButtons={eventButtons}
            />
        );

        const scheduleProps = mockScheduleXCalendar.mock.calls[0][0];
        const EventModal = scheduleProps.customComponents.eventModal;

        render(<EventModal calendarEvent={blocks[0]} />);

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(mockDeleteTimeBlock).not.toHaveBeenCalled();
        expect(mockRemove).not.toHaveBeenCalled();
        expect(setBlocks).not.toHaveBeenCalled();
    });

    it('logs an error when deletion fails', async () => {
        global.confirm.mockReturnValue(true);
        const error = new Error('Delete failed');
        mockDeleteTimeBlock.mockRejectedValue(error);
        const setBlocks = vi.fn();
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const eventButtons = (calendarEvent, handleDelete) => (
            <button onClick={() => handleDelete(calendarEvent.id)}>
                Delete
            </button>
        );

        render(
            <CalendarView
                blocks={blocks}
                setBlocks={setBlocks}
                title="Calendar"
                eventButtons={eventButtons}
            />
        );

        const scheduleProps = mockScheduleXCalendar.mock.calls[0][0];
        const EventModal = scheduleProps.customComponents.eventModal;

        render(<EventModal calendarEvent={blocks[0]} />);

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to delete', error);
        });

        expect(mockRemove).not.toHaveBeenCalled();
        expect(setBlocks).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
