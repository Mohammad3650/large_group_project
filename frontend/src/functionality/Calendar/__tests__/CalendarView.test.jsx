import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCreateViewDay, mockCreateViewWeek, mockCreateViewMonthGrid, mockCreateViewMonthAgenda, mockCreateEventModalPlugin, mockUseCalendarApp, mockRemove, mockDeleteTimeBlock, mockScheduleXCalendar } = vi.hoisted(() => ({
    mockCreateViewDay: vi.fn(() => 'day-view'),
    mockCreateViewWeek: vi.fn(() => 'week-view'),
    mockCreateViewMonthGrid: vi.fn(() => 'month-view'),
    mockCreateViewMonthAgenda: vi.fn(() => 'month-agenda-view'),
    mockCreateEventModalPlugin: vi.fn(() => 'event-modal-plugin'),
    mockUseCalendarApp: vi.fn(() => 'mock-calendar-app'),
    mockRemove: vi.fn(),
    mockDeleteTimeBlock: vi.fn(),
    mockScheduleXCalendar: vi.fn()
}));

vi.mock('@schedule-x/calendar', () => ({
    createViewDay: mockCreateViewDay,
    createViewWeek: mockCreateViewWeek,
    createViewMonthGrid: mockCreateViewMonthGrid,
    createViewMonthAgenda: mockCreateViewMonthAgenda
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
        title: 'Calendar'
    };

    return render(<CalendarView {...defaultProps} {...overrides} />);
}

function renderEventModal() {
    const scheduleProps = mockScheduleXCalendar.mock.calls[0][0];
    const EventModal = scheduleProps.customComponents.eventModal;
    return render(<EventModal calendarEvent={blocks[0]} />);
}

describe('CalendarView component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.confirm = vi.fn();
    });

    it('renders the title, header buttons and calendar', () => {
        renderCalendarView({
            title: 'Welcome to your calendar, Mohammad!',
            headerButtons: <button>Add Task</button>
        });

        expect(screen.getByText('Welcome to your calendar, Mohammad!')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
        expect(screen.getByText('Mock ScheduleXCalendar')).toBeInTheDocument();
    });

    it('creates the calendar app with the correct configuration', () => {
        renderCalendarView();

        expect(mockCreateViewDay).toHaveBeenCalled();
        expect(mockCreateViewWeek).toHaveBeenCalled();
        expect(mockCreateViewMonthGrid).toHaveBeenCalled();
        expect(mockCreateViewMonthAgenda).toHaveBeenCalled();
        expect(mockCreateEventModalPlugin).toHaveBeenCalled();

        expect(mockUseCalendarApp).toHaveBeenCalledWith({
            views: ['day-view', 'week-view', 'month-view', 'month-agenda-view'],
            plugins: ['event-modal-plugin', { remove: mockRemove }],
            events: blocks,
            selectedDate: Temporal.Now.plainDateISO(getUserTimezone()),
            timezone: getUserTimezone()
        });
    });

    it('passes custom components to ScheduleXCalendar and renders event modal content', () => {
        renderCalendarView();

        expect(mockScheduleXCalendar).toHaveBeenCalled();

        const scheduleProps = mockScheduleXCalendar.mock.calls[0][0];
        expect(scheduleProps.calendarApp).toBe('mock-calendar-app');
        expect(scheduleProps.customComponents).toBeTruthy();

        const { container } = renderEventModal();

        expect(screen.getByText('Algorithms Lecture')).toBeInTheDocument();
        expect(screen.getByText('19/02/2026')).toBeInTheDocument();
        expect(screen.getByText('09:00 - 11:00')).toBeInTheDocument();
        expect(screen.getByText('Bush House')).toBeInTheDocument();
        expect(screen.getByText('Lecture')).toBeInTheDocument();
        expect(screen.getByText('Graphs and shortest paths')).toBeInTheDocument();

        expect(screen.getByAltText('Date')).toBeInTheDocument();
        expect(screen.getByAltText('Time')).toBeInTheDocument();
        expect(screen.getByAltText('Location')).toBeInTheDocument();
        expect(screen.getByAltText('Block Type')).toBeInTheDocument();
        expect(screen.getByAltText('Description')).toBeInTheDocument();

        expect(container.querySelector('.sx__event-modal__title')).toBeInTheDocument();
        expect(container.querySelector('.sx__event-modal__description')).toBeInTheDocument();
        expect(container.querySelector('.buttons')).toBeInTheDocument();
    });

    it('renders event buttons when eventButtons is provided', () => {
        const eventButtons = vi.fn((calendarEvent) => <button>Edit {calendarEvent.id}</button>);

        renderCalendarView({ eventButtons });
        renderEventModal();

        expect(eventButtons).toHaveBeenCalled();
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

        const eventButtons = (calendarEvent, handleDelete) => <button onClick={() => handleDelete(calendarEvent.id)}>Delete</button>;

        renderCalendarView({ setBlocks, eventButtons });
        renderEventModal();

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

        const eventButtons = (calendarEvent, handleDelete) => <button onClick={() => handleDelete(calendarEvent.id)}>Delete</button>;

        renderCalendarView({ setBlocks, eventButtons });
        renderEventModal();

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
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const eventButtons = (calendarEvent, handleDelete) => <button onClick={() => handleDelete(calendarEvent.id)}>Delete</button>;

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
});

it('passes an empty events array when blocks is not an array', () => {
    renderCalendarView({ blocks: null });

    expect(mockUseCalendarApp).toHaveBeenCalledWith({
        views: ['day-view', 'week-view', 'month-view', 'month-agenda-view'],
        plugins: ['event-modal-plugin', { remove: mockRemove }],
        events: [],
        selectedDate: Temporal.Now.plainDateISO(getUserTimezone()),
        timezone: getUserTimezone()
    });
});

it('renders the event modal in dark theme', () => {
    document.body.classList.add('dark-theme');

    renderCalendarView();
    renderEventModal();

    expect(screen.getByText('Algorithms Lecture')).toBeInTheDocument();

    document.body.classList.remove('dark-theme');
});
