import { describe, it, expect } from "vitest";
import getDate from "../getDate.js";

describe("Tests for getDate", () => {
    
    it("returns a Date object from a task's date and startTime", () => {
        const task = { date: "2024-01-15", startTime: "09:00" };
        expect(getDate(task)).toEqual(new Date("2024-01-15T09:00"));
    });

    it("returns the correct time when startTime is midnight", () => {
        const task = { date: "2024-01-15", startTime: "00:00" };
        expect(getDate(task)).toEqual(new Date("2024-01-15T00:00"));
    });

    it("returns an earlier date for an earlier time", () => {
        const earlier = { date: "2024-01-15", startTime: "09:00" };
        const later = { date: "2024-01-15", startTime: "10:00" };
        expect(getDate(earlier).getTime()).toBeLessThan(getDate(later).getTime());
    });

    it("handles missing startTime", () => {
        const task = { date: "2024-01-15" };
        const result = getDate(task);

        expect(result).toBeInstanceOf(Date);
        expect(isNaN(result.getTime())).toBe(true); // Invalid Date
    });

    it("handles missing date", () => {
        const task = { startTime: "09:00" };
        const result = getDate(task);

        expect(result).toBeInstanceOf(Date);
        expect(isNaN(result.getTime())).toBe(true);
    });

    it("handles completely invalid date/time values", () => {
        const task = { date: "invalid-date", startTime: "invalid-time" };
        const result = getDate(task);

        expect(result).toBeInstanceOf(Date);
        expect(isNaN(result.getTime())).toBe(true);
    });
});