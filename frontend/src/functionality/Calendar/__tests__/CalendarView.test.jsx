import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
    mockCreateViewDay,
    mockCreateViewWeek,
    mockCreateViewMonthGrid,
    mockCreateEventModalPlugin,
    mockUseCalendarApp,
    mockRemove,
    mockDeleteTimeBlock,
    mockScheduleXCalendar,
    mockCreateCalendarCustomComponents,
    mockGetUserTimezone
} = vi.hoisted(() => ({
    mockCreateViewDay: vi.fn(() => 'day-view'),
    mockCreateViewWeek: vi.fn(() => 'week-view'),
    mockCreateViewMonthGrid: vi.fn(() => 'month-view'),
    mockCreateEventModalPlugin: vi.fn(() => 'event-modal-plugin'),
    mockUseCalendarApp: vi.fn(() => 'mock-calendar-app'),
    mockRemove: vi.fn(),
    mockDeleteTimeBlock: vi.fn(),
    mockScheduleXCalendar: vi.fn(),
    mockCreateCalendarCustomComponents: vi.fn(),
    mockGetUserTimezone: vi.fn(() => 'Europe/London')
}));

vi.mock('@schedule-x/calendar', () => ({
    createViewDay: mockCreateViewDay,
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

vi.mock('../../../utils/Api/deleteTimeBlock.js', () => ({
    default: mockDeleteTimeBlock
}));

vi.mock('../../../utils/Helpers/getUserTimezone.js', () => ({
    default: mockGetUserTimezone
}));

vi.mock('../createCalendarCustomComponents.jsx', () => ({
    createCalendarCustomComponents: (eventButtons, handleDelete) => {
        mockCreateCalendarCustomComponents(eventButtons, handleDelete);

        return {
            eventModal: ({ calendarEvent }) => (
                <div className="event-modal-container">
                    <h2>{calendarEvent.title}</h2>
                    <p>{calendarEvent.location}</p>
                    <p>{calendarEvent.blockType}</p>
                    <p>{calendarEvent.description}</p>
                    <div className="buttons">
                        {eventButtons ? eventButtons(calendarEvent, handleDelete) : null}
                    </div>
                </div>
            )
        };
    }
}));

import CalendarView from '../CalendarView.jsx';

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

function renderCalendarView(overrides = {}) {
    const defaultProps = {
        blocks,
        setBlocks: vi.fn(),
        title: 'Calendar',
        headerButtons: undefined,
        eventButtons: undefined
    };

    return render(<CalendarView {...defaultProps} {...overrides} />);
}

function renderEventModal(calendarEvent = blocks[0]) {
    const scheduleProps = mockScheduleXCalendar.mock.calls.at(-1)[0];
    const EventModal = scheduleProps.customComponents.eventModal;
    return render(<EventModal calendarEvent={calendarEvent} />);
}

describe('CalendarView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.confirm = vi.fn();
    });

    it('renders title, header buttons, and calendar', () => {
        renderCalendarView({
            title: 'Welcome to your calendar, Mohammad!',
            headerButtons: <button>Add Task</button>
        });

        expect(screen.getByText('Welcome to your calendar, Mohammad!')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
        expect(screen.getByText('Mock ScheduleXCalendar')).toBeInTheDocument();
    });

    it('renders without header buttons', () => {
        renderCalendarView();

        expect(screen.getByText('Calendar')).toBeInTheDocument();
        expect(screen.getByText('Mock ScheduleXCalendar')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add Task' })).not.toBeInTheDocument();
    });

    it('creates the calendar app with the correct configuration', () => {
        renderCalendarView();

        expect(mockCreateViewDay).toHaveBeenCalledTimes(1);
        expect(mockCreateViewWeek).toHaveBeenCalledTimes(1);
        expect(mockCreateViewMonthGrid).toHaveBeenCalledTimes(1);
        expect(mockCreateEventModalPlugin).toHaveBeenCalledTimes(1);
        expect(mockGetUserTimezone).toHaveBeenCalled();

        expect(mockUseCalendarApp).toHaveBeenCalledWith({
            views: ['day-view', 'week-view', 'month-view'],
            plugins: ['event-modal-plugin', { remove: mockRemove }],
            events: blocks,
            timezone: 'Europe/London',
            selectedDate: Temporal.Now.plainDateISO('Europe/London'),
            isResponsive: false
        });
    });

    it('passes an empty events array when blocks is not an array', () => {
        renderCalendarView({ blocks: null });

        expect(mockUseCalendarApp).toHaveBeenLastCalledWith({
            views: ['day-view', 'week-view', 'month-view'],
            plugins: ['event-modal-plugin', { remove: mockRemove }],
            events: [],
            timezone: 'Europe/London',
            selectedDate: Temporal.Now.plainDateISO('Europe/London'),
            isResponsive: false
        });
    });

    it('creates custom components with eventButtons and handleDelete', () => {
        const eventButtons = vi.fn(() => <button>Edit</button>);

        renderCalendarView({ eventButtons });

        expect(mockCreateCalendarCustomComponents).toHaveBeenCalledTimes(1);
        expect(mockCreateCalendarCustomComponents.mock.calls[0][0]).toBe(eventButtons);
        expect(typeof mockCreateCalendarCustomComponents.mock.calls[0][1]).toBe('function');
    });

    it('passes calendar app and custom components to ScheduleXCalendar', () => {
        renderCalendarView();

        expect(mockScheduleXCalendar).toHaveBeenCalledTimes(1);

        const scheduleProps = mockScheduleXCalendar.mock.calls[0][0];
        expect(scheduleProps.calendarApp).toBe('mock-calendar-app');
        expect(scheduleProps.customComponents).toBeTruthy();
        expect(typeof scheduleProps.customComponents.eventModal).toBe('function');
    });

    it('renders event modal content', () => {
        renderCalendarView();
        const { container } = renderEventModal();

        expect(screen.getByText('Algorithms Lecture')).toBeInTheDocument();
        expect(screen.getByText('Bush House')).toBeInTheDocument();
        expect(screen.getByText('Lecture')).toBeInTheDocument();
        expect(screen.getByText('Graphs and shortest paths')).toBeInTheDocument();

        expect(container.querySelector('.event-modal-container')).toBeInTheDocument();
        expect(container.querySelector('.buttons')).toBeInTheDocument();
    });

    it('renders event buttons when eventButtons is provided', () => {
        const eventButtons = vi.fn((calendarEvent) => <button>Edit {calendarEvent.id}</button>);

        renderCalendarView({ eventButtons });
        renderEventModal();

        expect(eventButtons).toHaveBeenCalledWith(
            expect.objectContaining({ id: 7 }),
            expect.any(Function)
        );
        expect(screen.getByRole('button', { name: 'Edit 7' })).toBeInTheDocument();
    });

    it('renders no event buttons when eventButtons is not provided', () => {
        renderCalendarView();
        const { container } = renderEventModal();

        expect(container.querySelector('.buttons')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('deletes an event when confirmed', async () => {
        global.confirm.mockReturnValue(true);
        mockDeleteTimeBlock.mockResolvedValue({});
        const setBlocks = vi.fn();

        const eventButtons = (calendarEvent, handleDelete) => (
            <button onClick={() => handleDelete(calendarEvent.id)}>Delete</button>
        );

        renderCalendarView({ setBlocks, eventButtons });
        renderEventModal();

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(mockDeleteTimeBlock).toHaveBeenCalledWith(7);
        });

        expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?');
        expect(mockRemove).toHaveBeenCalledWith(7);
        expect(setBlocks).toHaveBeenCalledTimes(1);

        const updater = setBlocks.mock.calls[0][0];
        expect(updater(blocks)).toEqual([]);
    });

    it('does not delete an event when confirmation is cancelled', () => {
        global.confirm.mockReturnValue(false);
        const setBlocks = vi.fn();

        const eventButtons = (calendarEvent, handleDelete) => (
            <button onClick={() => handleDelete(calendarEvent.id)}>Delete</button>
        );

        renderCalendarView({ setBlocks, eventButtons });
        renderEventModal();

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?');
        expect(mockDeleteTimeBlock).not.toHaveBeenCalled();
        expect(mockRemove).not.toHaveBeenCalled();
        expect(setBlocks).not.toHaveBeenCalled();
    });

    it('logs an error when deletion fails', async () => {
        global.confirm.mockReturnValue(true);
        const error = new Error('Delete failed');
        mockDeleteTimeBlock.mockRejectedValue(error);
        const setBlocks = vi.fn();
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const eventButtons = (calendarEvent, handleDelete) => (
            <button onClick={() => handleDelete(calendarEvent.id)}>Delete</button>
        );

        renderCalendarView({ setBlocks, eventButtons });
        renderEventModal();

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to delete event with ID', 7, error);
        });

        expect(mockRemove).not.toHaveBeenCalled();
        expect(setBlocks).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('applies the expected layout classes', () => {
        const { container } = renderCalendarView();

        expect(container.querySelector('.calendar-content')).toBeInTheDocument();
        expect(container.querySelector('.actual-calendar')).toBeInTheDocument();
        expect(container.querySelector('.welcome-message')).toBeInTheDocument();
    });
});
