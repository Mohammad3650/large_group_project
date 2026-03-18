import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import TaskItem from "../TaskItem";

vi.mock("../../assets/Dashboard/ding.mp3", () => ({ default: "ding.mp3" }));
vi.mock("../stylesheets/TaskItem.css", () => ({}));

const mockPlay = vi.fn().mockResolvedValue(undefined);

class MockAudio {
    constructor() {
        this.play = mockPlay;
        this.currentTime = 0;
        this.volume = 0;
    }
}
vi.stubGlobal("Audio", MockAudio);

const defaultProps = {
    name: "Finish coursework",
    date: "2026-03-18",
    startTime: "09:00",
    endTime: "10:00",
    onDelete: vi.fn(),
    overdue: false,
};

describe("TaskItem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPlay.mockResolvedValue(undefined);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders the task name", () => {
        render(<TaskItem {...defaultProps} />);
        expect(screen.getByText("Finish coursework")).toBeInTheDocument();
    });

    it("renders the formatted date and time", () => {
        render(<TaskItem {...defaultProps} />);
        expect(screen.getByText(/09:00 - 10:00 18 Mar/)).toBeInTheDocument();
    });

    it("renders the checkbox as unchecked by default", () => {
        render(<TaskItem {...defaultProps} />);
        expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("applies the overdue-text class to the label when overdue is true", () => {
        render(<TaskItem {...defaultProps} overdue={true} />);
        expect(screen.getByText("Finish coursework")).toHaveClass("overdue-text");
    });

    it("does not apply the overdue-text class when overdue is false", () => {
        render(<TaskItem {...defaultProps} overdue={false} />);
        expect(screen.getByText("Finish coursework")).not.toHaveClass("overdue-text");
    });

    it("checks the checkbox and starts fading when clicked", async () => {
        render(<TaskItem {...defaultProps} />);
        await act(async () => {
            fireEvent.click(screen.getByRole("checkbox").closest("div"));
        });
        expect(screen.getByRole("checkbox")).toBeChecked();
        expect(screen.getByRole("checkbox").closest("div")).toHaveClass("fading");
    });

    it("calls onDelete after 500ms when clicked", async () => {
        render(<TaskItem {...defaultProps} />);
        await act(async () => {
            fireEvent.click(screen.getByRole("checkbox").closest("div"));
        });
        await act(async () => {
            vi.advanceTimersByTime(500);
        });
        expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });

    it("does not call onDelete or play sound if already checked", async () => {
        render(<TaskItem {...defaultProps} />);
        const div = screen.getByRole("checkbox").closest("div");

        await act(async () => { fireEvent.click(div); });
        await act(async () => { vi.advanceTimersByTime(500); });
        const playCallCount = mockPlay.mock.calls.length;

        await act(async () => { fireEvent.click(div); });
        await act(async () => { vi.advanceTimersByTime(500); });

        expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
        expect(mockPlay.mock.calls.length).toBe(playCallCount);
    });

    it("plays the ding sound when clicked", async () => {
        render(<TaskItem {...defaultProps} />);
        await act(async () => {
            fireEvent.click(screen.getByRole("checkbox").closest("div"));
        });
        expect(mockPlay).toHaveBeenCalled();
    });

    it("logs an error when the audio fails to play", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        mockPlay.mockRejectedValue(new Error("Audio error"));

        render(<TaskItem {...defaultProps} />);
        await act(async () => {
            fireEvent.click(screen.getByRole("checkbox").closest("div"));
        });

        await act(async () => { vi.advanceTimersByTime(500); });

        expect(consoleSpy).toHaveBeenCalledWith("Audio failed:", expect.any(Error));
        consoleSpy.mockRestore();
    });
});