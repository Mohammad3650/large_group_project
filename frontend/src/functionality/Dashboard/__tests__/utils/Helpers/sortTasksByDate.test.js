import { describe, it, expect } from "vitest";
import sortTasksByDate from "../../../utils/Helpers/sortTasksByDate.js";

describe("Tests for sortTasksByDate", () => {
    it("sorts earlier tasks before later tasks (same date)", () => {
        const a = { date: "2024-01-15", startTime: "09:00" };
        const b = { date: "2024-01-15", startTime: "10:00" };
        expect(sortTasksByDate(a, b)).toBeLessThan(0);
    });

    it("sorts later tasks after earlier tasks (same date)", () => {
        const a = { date: "2024-01-15", startTime: "10:00" };
        const b = { date: "2024-01-15", startTime: "09:00" };
        expect(sortTasksByDate(a, b)).toBeGreaterThan(0);
    });

    it("returns zero for two tasks with identical datetimes", () => {
        const a = { date: "2024-01-15", startTime: "09:00" };
        const b = { date: "2024-01-15", startTime: "09:00" };
        expect(sortTasksByDate(a, b)).toBe(0);
    });

    it("sorts a earlier date before a later date", () => {
        const a = { date: "2024-01-14", startTime: "09:00" };
        const b = { date: "2024-01-15", startTime: "09:00" };
        expect(sortTasksByDate(a, b)).toBeLessThan(0);
    });

    it("sorts a later date after an earlier date", () => {
        const a = { date: "2024-01-15", startTime: "09:00" };
        const b = { date: "2024-01-14", startTime: "09:00" };
        expect(sortTasksByDate(a, b)).toBeGreaterThan(0);
    });

    it("handles a year boundary (Dec 31 -> Jan 1)", () => {
        const a = { date: "2023-12-31", startTime: "23:59" };
        const b = { date: "2024-01-01", startTime: "00:00" };
        expect(sortTasksByDate(a, b)).toBeLessThan(0);
    });

    it("handles a month boundary (Jan 31 -> Feb 1)", () => {
        const a = { date: "2024-01-31", startTime: "09:00" };
        const b = { date: "2024-02-01", startTime: "09:00" };
        expect(sortTasksByDate(a, b)).toBeLessThan(0);
    });

    it("handles a leap day boundary (Feb 28 -> Feb 29)", () => {
        const a = { date: "2024-02-28", startTime: "09:00" };
        const b = { date: "2024-02-29", startTime: "09:00" };
        expect(sortTasksByDate(a, b)).toBeLessThan(0);
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

    it("leaves an already-sorted array in the same order", () => {
        const tasks = [
            { date: "2024-01-14", startTime: "08:00" },
            { date: "2024-01-15", startTime: "09:00" },
            { date: "2024-01-15", startTime: "10:00" },
        ];
        const sorted = [...tasks].sort(sortTasksByDate);
        expect(sorted[0]).toEqual({ date: "2024-01-14", startTime: "08:00" });
        expect(sorted[1]).toEqual({ date: "2024-01-15", startTime: "09:00" });
        expect(sorted[2]).toEqual({ date: "2024-01-15", startTime: "10:00" });
    });

    it("handles an array with a single task without throwing", () => {
        const tasks = [{ date: "2024-01-15", startTime: "09:00" }];
        expect(() => [...tasks].sort(sortTasksByDate)).not.toThrow();
    });

    it("handles an empty array without throwing", () => {
        expect(() => [].sort(sortTasksByDate)).not.toThrow();
    });

    it("returns NaN when startTime is missing (invalid input — caller must ensure fields exist)", () => {
        const a = { date: "2024-01-14" };
        const b = { date: "2024-01-15" };
        const result = sortTasksByDate(a, b);
        expect(result).toBeNaN();
    });

    it("returns NaN when date is missing (invalid input — caller must ensure fields exist)", () => {
        const a = { startTime: "09:00" };
        const b = { startTime: "10:00" };
        const result = sortTasksByDate(a, b);
        expect(result).toBeNaN();
    });
});