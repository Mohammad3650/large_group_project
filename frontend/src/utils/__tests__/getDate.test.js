import { describe, it, expect } from "vitest";
import getDate from "../getDate.js";

describe("getDate", () => {
    it("returns a Date object from a task's date and startTime", () => {
        const task = { date: "2024-01-15", startTime: "09:00" };
        expect(getDate(task)).toEqual(new Date("2024-01-15T09:00"));
    });

    it("returns the correct time when startTime is midnight", () => {
        const task = { date: "2024-01-15", startTime: "00:00" };
        expect(getDate(task)).toEqual(new Date("2024-01-15T00:00"));
    });

    it("handles tasks on different dates correctly", () => {
        const task = { date: "2024-03-20", startTime: "14:30" };
        expect(getDate(task)).toEqual(new Date("2024-03-20T14:30"));
    });
});