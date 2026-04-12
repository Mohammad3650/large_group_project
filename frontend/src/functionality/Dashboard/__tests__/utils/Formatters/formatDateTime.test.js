import { describe, it, expect } from "vitest";
import formatDateTime from "../../../utils/Formatters/formatDateTime.js";

describe("Tests for formatDateTime", () => {
    it("formats the date and time into a human-readable string", () => {
        expect(formatDateTime("2026-02-19", "09:00", "10:00")).toBe("09:00 - 10:00 Thu 19 Feb");
    });

    it("correctly formats a different date and time", () => {
        expect(formatDateTime("2026-12-25", "14:00", "15:30")).toBe("14:00 - 15:30 Fri 25 Dec");
    });

    it("correctly formats midnight as 00:00", () => {
        expect(formatDateTime("2026-03-18", "00:00", "01:00")).toBe("00:00 - 01:00 Wed 18 Mar");
    });

    it("handles same start and end time", () => {
        expect(formatDateTime("2026-03-18", "09:00", "09:00")).toBe("09:00 - 09:00 Wed 18 Mar");
    });
});