import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../Dashboard";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("../../../api.js", () => ({
    api: { get: vi.fn() },
}));
vi.mock("../../../utils/useTimeBlocks.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../utils/useTasksByDateGroup.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../utils/handleExportCsv.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../utils/handleExportIcs.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../utils/getCalendarSubscriptions.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../utils/createCalendarSubscription.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../utils/deleteCalendarSubscription.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../utils/refreshCalendarSubscription.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../components/Navbar.jsx", () => ({
    default: () => <nav>Navbar</nav>,
}));
vi.mock("../NotesSection.jsx", () => ({
    default: () => <div><input placeholder="Notes" /></div>,
}));
vi.mock("../SubscriptionForm.jsx", () => ({
    default: ({ onImport }) => (
        <button onClick={() => onImport({ name: "Test", source_url: "http://test.com" })}>
            Import
        </button>
    ),
}));
vi.mock("../SubscriptionList.jsx", () => ({
    default: ({ onRefresh, onDelete }) => (
        <div>
            <button onClick={() => onRefresh(1)}>Refresh</button>
            <button onClick={() => onDelete(1)}>Delete</button>
        </div>
    ),
}));
vi.mock("../stylesheets/Dashboard.css", () => ({}));
vi.mock("../TaskGroup.jsx", () => ({
    default: ({ title, tasks = [] }) => tasks.length === 0 ? null : (
        <div>
            <span>{title}</span>
            {tasks.map(t => <div key={t.id}>{t.name}</div>)}
        </div>
    ),
}));

import * as apiModule from "../../../api.js";
import * as useTimeBlocksModule from "../../../utils/useTimeBlocks.js";
import * as useTasksByDateGroupModule from "../../../utils/useTasksByDateGroup.js";
import * as handleExportCsvModule from "../../../utils/handleExportCsv.js";
import * as handleExportIcsModule from "../../../utils/handleExportIcs.js";
import * as getCalendarSubscriptionsModule from "../../../utils/getCalendarSubscriptions.js";
import * as createCalendarSubscriptionModule from "../../../utils/createCalendarSubscription.js";
import * as deleteCalendarSubscriptionModule from "../../../utils/deleteCalendarSubscription.js";
import * as refreshCalendarSubscriptionModule from "../../../utils/refreshCalendarSubscription.js";

const today = new Date();
today.setHours(0, 0, 0, 0);
const formatDate = (d) => d.toISOString().split("T")[0];

const todayStr = formatDate(today);
const tomorrowStr = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
const in3DaysStr = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3));
const in10DaysStr = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10));
const yesterdayStr = formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));

const mockBlocks = [
    { id: 1, name: "Overdue Task", date: yesterdayStr, startTime: "09:00", endTime: "10:00" },
    { id: 2, name: "Today Task", date: todayStr, startTime: "09:00", endTime: "10:00" },
    { id: 3, name: "Tomorrow Task", date: tomorrowStr, startTime: "09:00", endTime: "10:00" },
    { id: 4, name: "Week Task", date: in3DaysStr, startTime: "09:00", endTime: "10:00" },
    { id: 5, name: "Beyond Week Task", date: in10DaysStr, startTime: "09:00", endTime: "10:00" },
];

const mockRefetchBlocks = vi.fn();

const defaultTaskGroups = {
    overdueTasks: [mockBlocks[0]], setOverdueTasks: vi.fn(),
    todayTasks: [mockBlocks[1]], setTodayTasks: vi.fn(),
    tomorrowTasks: [mockBlocks[2]], setTomorrowTasks: vi.fn(),
    weekTasks: [mockBlocks[3]], setWeekTasks: vi.fn(),
    beyondWeekTasks: [mockBlocks[4]], setBeyondWeekTasks: vi.fn(),
    totalTasks: 5,
};

const emptyTaskGroups = {
    overdueTasks: [], setOverdueTasks: vi.fn(),
    todayTasks: [], setTodayTasks: vi.fn(),
    tomorrowTasks: [], setTomorrowTasks: vi.fn(),
    weekTasks: [], setWeekTasks: vi.fn(),
    beyondWeekTasks: [], setBeyondWeekTasks: vi.fn(),
    totalTasks: 0,
};

const renderDashboard = () =>
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

describe("Dashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiModule.api.get.mockResolvedValue({ data: { message: "Welcome back!" } });
        useTimeBlocksModule.default.mockReturnValue({
            blocks: mockBlocks,
            setBlocks: vi.fn(),
            error: "",
            loading: false,
            refetchBlocks: mockRefetchBlocks,
        });
        useTasksByDateGroupModule.default.mockReturnValue(defaultTaskGroups);
        getCalendarSubscriptionsModule.default.mockResolvedValue([]);
        vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders the notes section", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByPlaceholderText("Notes")).toBeInTheDocument());
    });

    it("renders the welcome message from the API", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Welcome back!")).toBeInTheDocument());
    });

    it("renders 'Loading...' before the API responds", async () => {
        apiModule.api.get.mockImplementation(() => new Promise(() => {}));
        await act(async () => { renderDashboard(); });
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders an error message when the dashboard API call fails with a non-401 error", async () => {
        apiModule.api.get.mockRejectedValue({ response: { status: 500 } });
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Failed to load dashboard")).toBeInTheDocument());
    });

    it("navigates to /login when the API returns a 401", async () => {
        apiModule.api.get.mockRejectedValue({ response: { status: 401 } });
        renderDashboard();
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
    });

    it("renders an error message when fetching subscriptions fails", async () => {
        getCalendarSubscriptionsModule.default.mockRejectedValue(new Error("Network error"));
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Failed to load calendar subscriptions")).toBeInTheDocument());
    });

    it("renders the Add Task button", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("+ Add Task")).toBeInTheDocument());
    });

    it("renders the Export CSV button", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Export CSV")).toBeInTheDocument());
    });

    it("calls handleExportCsv when the Export CSV button is clicked", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Export CSV")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Export CSV"));
        expect(handleExportCsvModule.default).toHaveBeenCalled();
    });

    it("renders the Export ICS button", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Export ICS")).toBeInTheDocument());
    });

    it("calls handleExportIcs when the Export ICS button is clicked", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Export ICS")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Export ICS"));
        expect(handleExportIcsModule.default).toHaveBeenCalled();
    });

    it("shows the no-tasks message when there are no tasks", async () => {
        useTasksByDateGroupModule.default.mockReturnValue(emptyTaskGroups);
        renderDashboard();
        await waitFor(() => expect(screen.getByText("🎉 Congrats, you have no tasks!")).toBeInTheDocument());
    });

    it("does not show the no-tasks message when there are tasks", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Welcome back!")).toBeInTheDocument());
        expect(screen.queryByText("🎉 Congrats, you have no tasks!")).not.toBeInTheDocument();
    });

    it("does not render task groups when there are no tasks", async () => {
        useTasksByDateGroupModule.default.mockReturnValue(emptyTaskGroups);
        renderDashboard();
        await waitFor(() => expect(screen.queryByText("Overdue")).not.toBeInTheDocument());
    });

    it("renders the Overdue task group with the correct task", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Overdue")).toBeInTheDocument());
        expect(screen.getByText("Overdue Task")).toBeInTheDocument();
    });

    it("renders the Today task group with the correct task", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Today")).toBeInTheDocument());
        expect(screen.getByText("Today Task")).toBeInTheDocument();
    });

    it("renders the Tomorrow task group with the correct task", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Tomorrow")).toBeInTheDocument());
        expect(screen.getByText("Tomorrow Task")).toBeInTheDocument();
    });

    it("renders the Next 7 Days task group with the correct task", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Next 7 Days")).toBeInTheDocument());
        expect(screen.getByText("Week Task")).toBeInTheDocument();
    });

    it("renders the After Next 7 Days task group with the correct task", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("After Next 7 Days")).toBeInTheDocument());
        expect(screen.getByText("Beyond Week Task")).toBeInTheDocument();
    });

    it("adds the dashboard-page class to the body on mount and removes it on unmount", async () => {
        const { unmount } = renderDashboard();
        await waitFor(() => expect(document.body).toHaveClass("dashboard-page"));
        unmount();
        expect(document.body).not.toHaveClass("dashboard-page");
    });

    it("scrolls to the top on mount", async () => {
        const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
        await act(async () => { renderDashboard(); });
        expect(scrollSpy).toHaveBeenCalledWith(0, 0);
        scrollSpy.mockRestore();
    });

    it("scrolls to the top on window resize", async () => {
        const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Welcome back!")).toBeInTheDocument());
        act(() => { window.dispatchEvent(new Event("resize")); });
        expect(scrollSpy).toHaveBeenCalledWith(0, 0);
        scrollSpy.mockRestore();
    });

    it("renders an error when blocksError is set", async () => {
        useTimeBlocksModule.default.mockReturnValue({
            blocks: null,
            setBlocks: vi.fn(),
            error: "Failed to load time blocks",
            loading: false,
            refetchBlocks: mockRefetchBlocks,
        });
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Failed to load time blocks")).toBeInTheDocument());
    });

    it("adds a new subscription when import succeeds", async () => {
        createCalendarSubscriptionModule.default.mockResolvedValue({
            subscription: { id: 1, name: "Test Sub" },
        });
        mockRefetchBlocks.mockResolvedValue(undefined);
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Import")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Import")); });
        expect(createCalendarSubscriptionModule.default).toHaveBeenCalled();
    });

    it("renders an error when import fails", async () => {
        createCalendarSubscriptionModule.default.mockRejectedValue({
            response: { data: { message: "Failed to import timetable" } },
        });
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Import")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Import")); });
        await waitFor(() => expect(screen.getByText("Failed to import timetable")).toBeInTheDocument());
    });

    it("renders the source_url error when import fails with a source_url error", async () => {
        createCalendarSubscriptionModule.default.mockRejectedValue({
            response: { data: { source_url: ["Invalid URL"] } },
        });
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Import")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Import")); });
        await waitFor(() => expect(screen.getByText("Invalid URL")).toBeInTheDocument());
    });

    it("renders the name error when import fails with a name error", async () => {
        createCalendarSubscriptionModule.default.mockRejectedValue({
            response: { data: { name: ["Name is required"] } },
        });
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Import")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Import")); });
        await waitFor(() => expect(screen.getByText("Name is required")).toBeInTheDocument());
    });

    it("renders a generic error when import fails with no specific error field", async () => {
        createCalendarSubscriptionModule.default.mockRejectedValue({
            response: { data: {} },
        });
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Import")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Import")); });
        await waitFor(() => expect(screen.getByText("Failed to import timetable")).toBeInTheDocument());
    });

    it("refreshes a subscription when refresh is clicked", async () => {
        getCalendarSubscriptionsModule.default.mockResolvedValue([{ id: 1, name: "Test Sub" }]);
        refreshCalendarSubscriptionModule.default.mockResolvedValue({
            subscription: { id: 1, name: "Updated Sub" },
        });
        mockRefetchBlocks.mockResolvedValue(undefined);
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Refresh")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Refresh")); });
        expect(refreshCalendarSubscriptionModule.default).toHaveBeenCalledWith(1);
    });

    it("only updates the matching subscription when refresh is clicked", async () => {
        getCalendarSubscriptionsModule.default.mockResolvedValue([
            { id: 1, name: "Sub One" },
            { id: 2, name: "Sub Two" },
        ]);
        refreshCalendarSubscriptionModule.default.mockResolvedValue({
            subscription: { id: 1, name: "Updated Sub One" },
        });
        mockRefetchBlocks.mockResolvedValue(undefined);
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Refresh")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Refresh")); });
        expect(refreshCalendarSubscriptionModule.default).toHaveBeenCalledWith(1);
    });

    it("renders an error when refresh fails", async () => {
        refreshCalendarSubscriptionModule.default.mockRejectedValue(new Error("Network error"));
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Refresh")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Refresh")); });
        await waitFor(() => expect(screen.getByText("Failed to refresh timetable subscription")).toBeInTheDocument());
    });

    it("deletes a subscription when delete is clicked", async () => {
        getCalendarSubscriptionsModule.default.mockResolvedValue([{ id: 1, name: "Test Sub" }]);
        deleteCalendarSubscriptionModule.default.mockResolvedValue(undefined);
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Delete")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Delete")); });
        expect(deleteCalendarSubscriptionModule.default).toHaveBeenCalledWith(1);
    });

    it("renders an error when deletion fails", async () => {
        deleteCalendarSubscriptionModule.default.mockRejectedValue(new Error("Network error"));
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Delete")).toBeInTheDocument());
        await act(async () => { fireEvent.click(screen.getByText("Delete")); });
        await waitFor(() => expect(screen.getByText("Failed to delete timetable subscription")).toBeInTheDocument());
    });
});