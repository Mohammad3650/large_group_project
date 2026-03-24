import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import useTasksByDateGroup from "../useTasksByDateGroup.js";

const makeTask = (daysFromToday, startTime = "09:00") => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + daysFromToday);
    return {
        date: date.toISOString().split("T")[0],
        startTime,
    };
};

function TestComponent({ blocks }) {
    const {
        overdueTasks, setOverdueTasks,
        todayTasks, setTodayTasks,
        tomorrowTasks, setTomorrowTasks,
        weekTasks, setWeekTasks,
        beyondWeekTasks, setBeyondWeekTasks,
        totalTasks
    } = useTasksByDateGroup(blocks);

    return (
        <div>
            <span data-testid="overdue">{overdueTasks.length}</span>
            <span data-testid="today">{todayTasks.length}</span>
            <span data-testid="tomorrow">{tomorrowTasks.length}</span>
            <span data-testid="week">{weekTasks.length}</span>
            <span data-testid="beyond">{beyondWeekTasks.length}</span>
            <span data-testid="total">{totalTasks}</span>
            <span data-testid="setOverdue">{typeof setOverdueTasks}</span>
            <span data-testid="setToday">{typeof setTodayTasks}</span>
            <span data-testid="setTomorrow">{typeof setTomorrowTasks}</span>
            <span data-testid="setWeek">{typeof setWeekTasks}</span>
            <span data-testid="setBeyond">{typeof setBeyondWeekTasks}</span>
            {todayTasks.map((task, index) => (
                <span key={index} data-testid={`today-task-${index}`}>{task.startTime}</span>
            ))}
        </div>
    );
}

describe("useTasksByDateGroup", () => {
    it("returns empty arrays when blocks is null", () => {
        render(<TestComponent blocks={null} />);
        expect(screen.getByTestId("total").textContent).toBe("0");
    });

    it("places a task from yesterday into overdueTasks", async () => {
        render(<TestComponent blocks={[makeTask(-1)]} />);
        await waitFor(() => expect(screen.getByTestId("overdue").textContent).toBe("1"));
    });

    it("places a task from today into todayTasks", async () => {
        render(<TestComponent blocks={[makeTask(0)]} />);
        await waitFor(() => expect(screen.getByTestId("today").textContent).toBe("1"));
    });

    it("places a task from tomorrow into tomorrowTasks", async () => {
        render(<TestComponent blocks={[makeTask(1)]} />);
        await waitFor(() => expect(screen.getByTestId("tomorrow").textContent).toBe("1"));
    });

    it("places a task in 5 days into weekTasks", async () => {
        render(<TestComponent blocks={[makeTask(5)]} />);
        await waitFor(() => expect(screen.getByTestId("week").textContent).toBe("1"));
    });

    it("places a task in 8 days into beyondWeekTasks", async () => {
        render(<TestComponent blocks={[makeTask(8)]} />);
        await waitFor(() => expect(screen.getByTestId("beyond").textContent).toBe("1"));
    });

    it("correctly computes totalTasks across all groups", async () => {
        const blocks = [makeTask(-1), makeTask(0), makeTask(1), makeTask(5), makeTask(8)];
        render(<TestComponent blocks={blocks} />);
        await waitFor(() => expect(screen.getByTestId("total").textContent).toBe("5"));
    });

    it("exposes setter functions for each group", () => {
        render(<TestComponent blocks={[]} />);
        expect(screen.getByTestId("setOverdue").textContent).toBe("function");
        expect(screen.getByTestId("setToday").textContent).toBe("function");
        expect(screen.getByTestId("setTomorrow").textContent).toBe("function");
        expect(screen.getByTestId("setWeek").textContent).toBe("function");
        expect(screen.getByTestId("setBeyond").textContent).toBe("function");
    });

    it("sorts tasks within a group in ascending datetime order", async () => {
        render(<TestComponent blocks={[makeTask(0, "11:00"), makeTask(0, "09:00")]} />);
        await waitFor(() => {
            expect(screen.getByTestId("today-task-0").textContent).toBe("09:00");
            expect(screen.getByTestId("today-task-1").textContent).toBe("11:00");
        });
    });

    it("places a task at exactly midnight today into todayTasks not overdueTasks", async () => {
        render(<TestComponent blocks={[makeTask(0, "00:00")]} />);
        await waitFor(() => expect(screen.getByTestId("today").textContent).toBe("1"));
        expect(screen.getByTestId("overdue").textContent).toBe("0");
    });

    it("places a task on the 7th day boundary into weekTasks not beyondWeekTasks", async () => {
        render(<TestComponent blocks={[makeTask(7, "00:00")]} />);
        await waitFor(() => expect(screen.getByTestId("week").textContent).toBe("1"));
        expect(screen.getByTestId("beyond").textContent).toBe("0");
    });

    it("handles an empty blocks array without errors", async () => {
        render(<TestComponent blocks={[]} />);
        await waitFor(() => expect(screen.getByTestId("total").textContent).toBe("0"));
    });

    it("re-groups tasks when blocks prop changes", async () => {
        const { rerender } = render(<TestComponent blocks={[makeTask(0)]} />);
        await waitFor(() => expect(screen.getByTestId("today").textContent).toBe("1"));

        rerender(<TestComponent blocks={[makeTask(-1), makeTask(-1)]} />);
        await waitFor(() => {
            expect(screen.getByTestId("overdue").textContent).toBe("2");
            expect(screen.getByTestId("today").textContent).toBe("0");
        });
    });

    it("correctly counts multiple tasks in the same bucket", async () => {
        render(<TestComponent blocks={[makeTask(0), makeTask(0), makeTask(0)]} />);
        await waitFor(() => expect(screen.getByTestId("today").textContent).toBe("3"));
    });

    it("places a task 2 days from now into weekTasks not tomorrowTasks", async () => {
        render(<TestComponent blocks={[makeTask(2)]} />);
        await waitFor(() => expect(screen.getByTestId("week").textContent).toBe("1"));
        expect(screen.getByTestId("tomorrow").textContent).toBe("0");
    });

    it("distributes tasks into the correct buckets simultaneously", async () => {
        const blocks = [makeTask(-1), makeTask(0), makeTask(1), makeTask(5), makeTask(8)];
        render(<TestComponent blocks={blocks} />);
        await waitFor(() => {
            expect(screen.getByTestId("overdue").textContent).toBe("1");
            expect(screen.getByTestId("today").textContent).toBe("1");
            expect(screen.getByTestId("tomorrow").textContent).toBe("1");
            expect(screen.getByTestId("week").textContent).toBe("1");
            expect(screen.getByTestId("beyond").textContent).toBe("1");
        });
    });

    it("populates groups when blocks updates from null to an array", async () => {
        const { rerender } = render(<TestComponent blocks={null} />);
        expect(screen.getByTestId("total").textContent).toBe("0");

        rerender(<TestComponent blocks={[makeTask(0), makeTask(1)]} />);
        await waitFor(() => {
            expect(screen.getByTestId("today").textContent).toBe("1");
            expect(screen.getByTestId("tomorrow").textContent).toBe("1");
        });
    });
});