import { describe, it, expect } from "vitest";
import sortTasksByDate from "../../../utils/Helpers/sortTasksByDate.js";

describe("Tests for sortTasksByDate", () => {
    it("sorts earlier tasks before later tasks (same date)", () => {
        expect(sortTasksByDate({ date: "2024-01-15", startTime: "09:00" }, { date: "2024-01-15", startTime: "10:00" })).toBeLessThan(0);
    });

    it("sorts later tasks after earlier tasks (same date)", () => {
        expect(sortTasksByDate({ date: "2024-01-15", startTime: "10:00" }, { date: "2024-01-15", startTime: "09:00" })).toBeGreaterThan(0);
    });

    it("returns zero for two tasks with identical datetimes", () => {
        expect(sortTasksByDate({ date: "2024-01-15", startTime: "09:00" }, { date: "2024-01-15", startTime: "09:00" })).toBe(0);
    });

    it("sorts a earlier date before a later date", () => {
        expect(sortTasksByDate({ date: "2024-01-14", startTime: "09:00" }, { date: "2024-01-15", startTime: "09:00" })).toBeLessThan(0);
    });

    it("correctly sorts an array of tasks by date and time", () => {
        const tasks = [
            { date: "2024-01-15", startTime: "12:00" },
            { date: "2024-01-14", startTime: "08:00" },
            { date: "2024-01-15", startTime: "08:00" },
        ];
        const sorted = [...tasks].sort(sortTasksByDate);
        expect(sorted[0]).toEqual({ date: "2024-01-14", startTime: "08:00" });
        expect(sorted[1]).toEqual({ date: "2024-01-15", startTime: "08:00" });
        expect(sorted[2]).toEqual({ date: "2024-01-15", startTime: "12:00" });
    });

    it("handles an empty array without throwing", () => {
        expect(() => [].sort(sortTasksByDate)).not.toThrow();
    });
});