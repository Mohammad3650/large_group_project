import { describe, it, expect } from "vitest";
import getDate from "../../../utils/Helpers/getDate.js";

describe("Tests for getDate", () => {
    it("returns a Date object from a task's date and startTime", () => {
        expect(getDate({ date: "2024-01-15", startTime: "09:00" })).toEqual(new Date("2024-01-15T09:00"));
    });

    it("returns the correct time when startTime is midnight", () => {
        expect(getDate({ date: "2024-01-15", startTime: "00:00" })).toEqual(new Date("2024-01-15T00:00"));
    });

    it("returns an earlier date for an earlier time", () => {
        expect(getDate({ date: "2024-01-15", startTime: "09:00" }).getTime())
            .toBeLessThan(getDate({ date: "2024-01-15", startTime: "10:00" }).getTime());
    });

    it("handles missing startTime", () => {
        const result = getDate({ date: "2024-01-15" });
        expect(result).toBeInstanceOf(Date);
        expect(isNaN(result.getTime())).toBe(true);
    });

    it("handles missing date", () => {
        const result = getDate({ startTime: "09:00" });
        expect(result).toBeInstanceOf(Date);
        expect(isNaN(result.getTime())).toBe(true);
    });

    it("handles completely invalid date/time values", () => {
        const result = getDate({ date: "invalid-date", startTime: "invalid-time" });
        expect(result).toBeInstanceOf(Date);
        expect(isNaN(result.getTime())).toBe(true);
    });
});