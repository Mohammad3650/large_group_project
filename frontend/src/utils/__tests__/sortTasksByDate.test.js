import { describe, it, expect } from "vitest";
import sortTasksByDate from "../sortTasksByDate.js";

describe("sortTasksByDate", () => {
    it("sorts earlier tasks before later tasks", () => {
        const a = { date: "2024-01-15", startTime: "09:00" };
        const b = { date: "2024-01-15", startTime: "10:00" };
        expect(sortTasksByDate(a, b)).toBeLessThan(0);
    });

    it("sorts later tasks after earlier tasks", () => {
        const a = { date: "2024-01-15", startTime: "10:00" };
        const b = { date: "2024-01-15", startTime: "09:00" };
        expect(sortTasksByDate(a, b)).toBeGreaterThan(0);
    });

    it("returns zero for two tasks with identical datetimes", () => {
        const a = { date: "2024-01-15", startTime: "09:00" };
        const b = { date: "2024-01-15", startTime: "09:00" };
        expect(sortTasksByDate(a, b)).toBe(0);
    });

    it("sorts tasks on different dates correctly", () => {
        const a = { date: "2024-01-14", startTime: "09:00" };
        const b = { date: "2024-01-15", startTime: "09:00" };
        expect(sortTasksByDate(a, b)).toBeLessThan(0);
    });
});