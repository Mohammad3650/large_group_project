import { describe, it, expect, vi, beforeEach } from "vitest";
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
vi.mock("../../../utils/handleExportCsv.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../utils/handleExportIcs.js", () => ({
    default: vi.fn(),
}));
vi.mock("../../../components/Navbar.jsx", () => ({
    default: () => <nav>Navbar</nav>,
}));
vi.mock("./NotesSection.jsx", () => ({
    default: () => <div><input placeholder="Notes" /></div>,
}));
vi.mock("./stylesheets/Dashboard.css", () => ({}));
vi.mock("./TaskGroup.jsx", () => ({
    default: ({ title, tasks = [] }) => tasks.length === 0 ? null : (
        <div>
            <span>{title}</span>
            {tasks.map(t => <div key={t.id}>{t.name}</div>)}
        </div>
    ),
}));

import * as apiModule from "../../../api.js";
import * as useTimeBlocksModule from "../../../utils/useTimeBlocks.js";
import * as handleExportCsvModule from "../../../utils/handleExportCsv.js";
import * as handleExportIcsModule from "../../../utils/handleExportIcs.js";

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

const renderDashboard = () =>
    render(<MemoryRouter><Dashboard /></MemoryRouter>);

describe("Dashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiModule.api.get.mockResolvedValue({ data: { message: "Welcome back!" } });
        useTimeBlocksModule.default.mockReturnValue({ blocks: mockBlocks });
    });

    it("renders the navbar and notes section", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Navbar")).toBeInTheDocument());
        expect(screen.getByPlaceholderText("Notes")).toBeInTheDocument();
    });

    it("renders the welcome message from the API", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Welcome back!")).toBeInTheDocument());
    });

    it("renders 'Loading...' before the API responds", async () => {
        apiModule.api.get.mockImplementation(() => new Promise(() => {}));
        renderDashboard();
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

    it("shows the no-tasks message when blocks is an empty array", async () => {
        useTimeBlocksModule.default.mockReturnValue({ blocks: [] });
        renderDashboard();
        await waitFor(() => expect(screen.getByText("🎉 Congrats, you have no tasks!")).toBeInTheDocument());
    });

    it("does not show the no-tasks message when there are tasks", async () => {
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Welcome back!")).toBeInTheDocument());
        expect(screen.queryByText("🎉 Congrats, you have no tasks!")).not.toBeInTheDocument();
    });

    it("does not render task groups while blocks is null", async () => {
        useTimeBlocksModule.default.mockReturnValue({ blocks: null });
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
        renderDashboard();
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

    it("displays tasks sorted by start time in ascending order within the same day", async () => {
        useTimeBlocksModule.default.mockReturnValue({
            blocks: [
                { id: 1, name: "Later Overdue", date: yesterdayStr, startTime: "11:00", endTime: "12:00" },
                { id: 2, name: "Earlier Overdue", date: yesterdayStr, startTime: "08:00", endTime: "09:00" },
            ]
        });
        renderDashboard();
        await waitFor(() => expect(screen.getByText("Earlier Overdue")).toBeInTheDocument());
        const taskElements = screen.getAllByText(/Overdue/i).filter(el => el.textContent !== "Overdue");
        expect(taskElements[0].textContent).toBe("Earlier Overdue");
        expect(taskElements[1].textContent).toBe("Later Overdue");
    });
});