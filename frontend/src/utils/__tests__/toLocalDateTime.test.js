import { describe, it, expect, vi } from "vitest";
import toLocalDateTime from "../toLocalDateTime";
import getUserTimezone from "../getUserTimezone";

vi.mock("../getUserTimezone", () => ({
    default: vi.fn(),
}));

describe("toLocalDateTime", () => {
    it("returns the correct localDate and localTime for a UTC time with no offset", () => {
        getUserTimezone.mockReturnValue("Europe/London");
        const result = toLocalDateTime("2024-03-18", "09:00:00");

        expect(result.localDate).toBe("2024-03-18");
        expect(result.localTime).toBe("09:00");
    });

    it("converts UTC time to a positive offset timezone correctly", () => {
        getUserTimezone.mockReturnValue("Europe/Paris");
        const result = toLocalDateTime("2024-03-18", "23:00:00");

        expect(result.localDate).toBe("2024-03-19");
        expect(result.localTime).toBe("00:00");
    });

    it("converts UTC time to a negative offset timezone correctly", () => {
        getUserTimezone.mockReturnValue("America/New_York");
        const result = toLocalDateTime("2024-03-18", "09:00:00");

        expect(result.localDate).toBe("2024-03-18");
        expect(result.localTime).toBe("05:00");
    });

    it("pads single-digit hours and minutes with a leading zero", () => {
        getUserTimezone.mockReturnValue("America/New_York");
        const result = toLocalDateTime("2024-03-18", "05:05:00");

        expect(result.localTime).toBe("01:05");
    });

    it("strips seconds from the time string before parsing", () => {
        getUserTimezone.mockReturnValue("Europe/London");
        const result = toLocalDateTime("2024-03-18", "09:00:59");

        expect(result.localTime).toBe("09:00");
    });

    it("returns a Temporal.ZonedDateTime object in the user's timezone", () => {
        getUserTimezone.mockReturnValue("Asia/Tokyo");
        const result = toLocalDateTime("2024-03-18", "09:00:00");

        expect(result.zonedDateTime.timeZoneId).toBe("Asia/Tokyo");
    });

    it("returns a zonedDateTime with the correctly converted hour", () => {
        getUserTimezone.mockReturnValue("Asia/Tokyo");
        const result = toLocalDateTime("2024-03-18", "09:00:00");

        expect(result.zonedDateTime.hour).toBe(18);
    });

    it("applies DST offset correctly for Europe/London in British Summer Time", () => {
        getUserTimezone.mockReturnValue("Europe/London");
        const result = toLocalDateTime("2024-03-31", "12:00:00");

        expect(result.localDate).toBe("2024-03-31");
        expect(result.localTime).toBe("13:00");
    });

    it("applies DST offset correctly for America/New_York in Eastern Daylight Time", () => {
        getUserTimezone.mockReturnValue("America/New_York");
        const result = toLocalDateTime("2024-03-12", "12:00:00");

        expect(result.localDate).toBe("2024-03-12");
        expect(result.localTime).toBe("08:00");
    });

    it("throws when time is undefined", () => {
        getUserTimezone.mockReturnValue("Europe/London");

        expect(() => toLocalDateTime("2024-03-18", undefined)).toThrow();
    });

    it("throws when date is undefined", () => {
        getUserTimezone.mockReturnValue("Europe/London");

        expect(() => toLocalDateTime(undefined, "09:00:00")).toThrow();
    });
});