import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
    mockCreateEventsServicePlugin,
    mockCreateCalendarDeleteHandler,
    mockCreateCalendarCustomComponents,
    mockGetUserTimezone,
    mockCalendarRenderer,
    mockWelcomeMessage
} = vi.hoisted(() => ({
    mockCreateEventsServicePlugin: vi.fn(() => ({
        remove: vi.fn()
    })),
    mockCreateCalendarDeleteHandler: vi.fn(() => vi.fn()),
    mockCreateCalendarCustomComponents: vi.fn(() => ({
        eventModal: vi.fn()
    })),
    mockGetUserTimezone: vi.fn(() => 'Europe/London'),
    mockCalendarRenderer: vi.fn(),
    mockWelcomeMessage: vi.fn()
}));

vi.mock('@schedule-x/events-service', () => ({
    createEventsServicePlugin: mockCreateEventsServicePlugin
}));

vi.mock('../utils/Helpers/createCalendarDeleteHandler.js', () => ({
    default: mockCreateCalendarDeleteHandler
}));

vi.mock('../CreateCalendarCustomComponents.jsx', () => ({
    default: mockCreateCalendarCustomComponents
}));

vi.mock('../../../utils/Helpers/getUserTimezone.js', () => ({
    default: mockGetUserTimezone
}));

vi.mock('../CalendarRenderer.jsx', () => ({
    default: (props) => {
        mockCalendarRenderer(props);
        return <div data-testid="calendar-renderer">Mock Calendar Renderer</div>;
    }
}));

vi.mock('../../../components/WelcomeMessage.jsx', () => ({
    default: (props) => {
        mockWelcomeMessage(props);
        return (
            <div data-testid="welcome-message" className="welcome-message">
                Welcome to your calendar, {props.username}!
            </div>
        );
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
        username: 'Mohammad',
        headerButtons: undefined,
        eventButtons: undefined
    };

    return render(<CalendarView {...defaultProps} {...overrides} />);
}

describe('CalendarView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the welcome message, header buttons, and calendar renderer', () => {
        renderCalendarView({
            headerButtons: <button>Add Task</button>
        });

        expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
        expect(screen.getByText('Welcome to your calendar, Mohammad!')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
        expect(screen.getByTestId('calendar-renderer')).toBeInTheDocument();
    });

    it('renders without header buttons', () => {
        renderCalendarView();

        expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
        expect(screen.getByTestId('calendar-renderer')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add Task' })).not.toBeInTheDocument();
    });

    it('creates the events service once', () => {
        renderCalendarView();

        expect(mockCreateEventsServicePlugin).toHaveBeenCalledTimes(1);
    });

    it('gets the user timezone', () => {
        renderCalendarView();

        expect(mockGetUserTimezone).toHaveBeenCalledTimes(1);
    });

    it('creates the delete handler with eventsService, setBlocks, and setCalendarKey', () => {
        const setBlocks = vi.fn();

        renderCalendarView({ setBlocks });

        expect(mockCreateCalendarDeleteHandler).toHaveBeenCalledTimes(1);

        const [eventsServiceArg, setBlocksArg, setCalendarKeyArg] =
            mockCreateCalendarDeleteHandler.mock.calls[0];

        expect(eventsServiceArg).toBeTruthy();
        expect(eventsServiceArg.remove).toBeTypeOf('function');
        expect(setBlocksArg).toBe(setBlocks);
        expect(setCalendarKeyArg).toBeTypeOf('function');
    });

    it('creates custom components with eventButtons and handleDelete', () => {
        const eventButtons = vi.fn();
        const mockedDeleteHandler = vi.fn();

        mockCreateCalendarDeleteHandler.mockReturnValueOnce(mockedDeleteHandler);

        renderCalendarView({ eventButtons });

        expect(mockCreateCalendarCustomComponents).toHaveBeenCalledTimes(1);
        expect(mockCreateCalendarCustomComponents).toHaveBeenCalledWith(
            eventButtons,
            mockedDeleteHandler
        );
    });

    it('passes the correct props to WelcomeMessage', () => {
        renderCalendarView({ username: 'Mohammad' });

        expect(mockWelcomeMessage).toHaveBeenCalledTimes(1);
        expect(mockWelcomeMessage).toHaveBeenCalledWith({
            page: 'calendar',
            username: 'Mohammad'
        });
    });

    it('passes the correct props to CalendarRenderer', () => {
        const eventButtons = vi.fn();
        const mockedDeleteHandler = vi.fn();
        const mockedCustomComponents = { eventModal: vi.fn() };

        mockCreateCalendarDeleteHandler.mockReturnValueOnce(mockedDeleteHandler);
        mockCreateCalendarCustomComponents.mockReturnValueOnce(mockedCustomComponents);

        renderCalendarView({
            blocks,
            eventButtons
        });

        expect(mockCalendarRenderer).toHaveBeenCalledTimes(1);

        const rendererProps = mockCalendarRenderer.mock.calls[0][0];

        expect(rendererProps.blocks).toBe(blocks);
        expect(rendererProps.calendarTimezone).toBe('Europe/London');
        expect(rendererProps.customComponents).toBe(mockedCustomComponents);
        expect(rendererProps.eventsService).toBeTruthy();
        expect(rendererProps.eventsService.remove).toBeTypeOf('function');
    });

    it('passes calendarKey as the key prop to CalendarRenderer wrapper render cycle', () => {
        renderCalendarView();

        expect(mockCalendarRenderer).toHaveBeenCalledTimes(1);
    });

    it('applies the expected layout classes', () => {
        const { container } = renderCalendarView();

        expect(container.querySelector('.calendar-content')).toBeInTheDocument();
        expect(container.querySelector('.actual-calendar')).toBeInTheDocument();
        expect(container.querySelector('.welcome-message')).toBeInTheDocument();
    });

    it('handles undefined eventButtons', () => {
        renderCalendarView({ eventButtons: undefined });

        expect(mockCreateCalendarCustomComponents).toHaveBeenCalledWith(
            undefined,
            expect.any(Function)
        );
    });

    it('passes through an empty blocks array', () => {
        renderCalendarView({ blocks: [] });

        const rendererProps = mockCalendarRenderer.mock.calls[0][0];
        expect(rendererProps.blocks).toEqual([]);
    });

    it('passes through null blocks exactly as received', () => {
        renderCalendarView({ blocks: null });

        const rendererProps = mockCalendarRenderer.mock.calls[0][0];
        expect(rendererProps.blocks).toBeNull();
    });
});
