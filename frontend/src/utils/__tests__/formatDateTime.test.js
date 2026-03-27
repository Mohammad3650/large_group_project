import { describe, it, expect } from "vitest";
import formatDateTime from "../formatDateTime.js";

describe("Tests for formatDateTime", () => {
    it("formats the date and time into a human-readable string", () => {
        const result = formatDateTime("2026-02-19", "09:00", "10:00");
        expect(result).toBe("09:00 - 10:00 19 Feb");
    });

    it("correctly formats a different date and time", () => {
        const result = formatDateTime("2026-12-25", "14:00", "15:30");
        expect(result).toBe("14:00 - 15:30 25 Dec");
    });

    it("correctly formats midnight as 00:00", () => {
        const result = formatDateTime("2026-03-18", "00:00", "01:00");
        expect(result).toBe("00:00 - 01:00 18 Mar");
    });

    it("handles same start and end time", () => {
        const result = formatDateTime("2026-03-18", "09:00", "09:00");
        expect(result).toBe("09:00 - 09:00 18 Mar");
    });
});
