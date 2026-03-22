import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import NotesSection from "../NotesSection";
import * as apiModule from "../../../api.js";


vi.mock("../stylesheets/NotesSection.css", () => ({}));
vi.mock("../../../api.js", () => ({
    api: {
        get: vi.fn(),
        put: vi.fn(),
    },
}));

describe("NotesSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(async () => {
        await act(async () => { vi.runAllTimers(); });
        vi.useRealTimers();
    });

    it("renders the notes textarea", async () => {
        apiModule.api.get.mockResolvedValue({ data: { content: "" } });
        await act(async () => { render(<NotesSection />); });
        expect(screen.getByPlaceholderText("Notes")).toBeInTheDocument();
    });

    it("fetches and displays the saved notes on mount", async () => {
        apiModule.api.get.mockResolvedValue({ data: { content: "My notes" } });
        await act(async () => { render(<NotesSection />); });
        await waitFor(() => expect(screen.getByDisplayValue("My notes")).toBeInTheDocument());
    });

    it("logs an error when fetching notes fails", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        apiModule.api.get.mockRejectedValue(new Error("Network error"));
        await act(async () => { render(<NotesSection />); });
        await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith("Failed to load notes", expect.any(Error)));
        consoleSpy.mockRestore();
    });

    it("shows 'Saving...' immediately when the user types", async () => {
        apiModule.api.get.mockResolvedValue({ data: { content: "" } });
        await act(async () => { render(<NotesSection />); });
        await waitFor(() => expect(apiModule.api.get).toHaveBeenCalled());

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText("Notes"), { target: { value: "New note" } });
        });
        expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("shows 'Saved ✓' after the debounce period", async () => {
        apiModule.api.get.mockResolvedValue({ data: { content: "" } });
        apiModule.api.put.mockResolvedValue({});
        await act(async () => { render(<NotesSection />); });
        await waitFor(() => expect(apiModule.api.get).toHaveBeenCalled());

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText("Notes"), { target: { value: "New note" } });
        });
        await act(async () => { vi.advanceTimersByTime(1000); });
        await waitFor(() => expect(screen.getByText("Saved ✓")).toBeInTheDocument());
        expect(apiModule.api.put).toHaveBeenCalledWith("/api/notes/save/", { content: "New note" });
    });

    it("shows 'Error saving ✗' when the save request fails", async () => {
        apiModule.api.get.mockResolvedValue({ data: { content: "" } });
        apiModule.api.put.mockRejectedValue(new Error("Network error"));
        await act(async () => { render(<NotesSection />); });
        await waitFor(() => expect(apiModule.api.get).toHaveBeenCalled());

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText("Notes"), { target: { value: "New note" } });
        });
        await act(async () => { vi.advanceTimersByTime(1000); });
        await waitFor(() => expect(screen.getByText("Error saving ✗")).toBeInTheDocument());
    });

    it("logs an error when saving notes fails", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        apiModule.api.get.mockResolvedValue({ data: { content: "" } });
        apiModule.api.put.mockRejectedValue(new Error("Network error"));
        await act(async () => { render(<NotesSection />); });
        await waitFor(() => expect(apiModule.api.get).toHaveBeenCalled());

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText("Notes"), { target: { value: "New note" } });
        });
        await act(async () => { vi.advanceTimersByTime(1000); });
        await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith("Failed to save notes", expect.any(Error)));
        consoleSpy.mockRestore();
    });

    it("debounces the save — does not call the API until 1 second after the last keystroke", async () => {
        apiModule.api.get.mockResolvedValue({ data: { content: "" } });
        apiModule.api.put.mockResolvedValue({});
        await act(async () => { render(<NotesSection />); });
        await waitFor(() => expect(apiModule.api.get).toHaveBeenCalled());

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText("Notes"), { target: { value: "A" } });
        });
        await act(async () => { vi.advanceTimersByTime(500); });
        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText("Notes"), { target: { value: "AB" } });
        });
        await act(async () => { vi.advanceTimersByTime(500); });

        expect(apiModule.api.put).not.toHaveBeenCalled();

        await act(async () => { vi.advanceTimersByTime(500); });
        await waitFor(() => expect(apiModule.api.put).toHaveBeenCalledTimes(1));
    });

    it("does not trigger a save when notes have not been loaded yet", async () => {
        apiModule.api.get.mockResolvedValue({ data: { content: "initial" } });
        apiModule.api.put.mockResolvedValue({});

        render(<NotesSection />);

        await act(async () => { vi.advanceTimersByTime(1000); });
        expect(apiModule.api.put).not.toHaveBeenCalled();
    });
});