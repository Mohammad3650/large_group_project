import { describe, it, expect, vi, afterEach } from "vitest";
import getUserTimezone from "../getUserTimezone";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("getUserTimezone", () => {
    it("returns the timezone from Intl.DateTimeFormat resolvedOptions", () => {
        vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
            resolvedOptions: () => ({ timeZone: "Europe/London" }),
        });

        expect(getUserTimezone()).toBe("Europe/London");
    });

    it("returns a different timezone when the system timezone changes", () => {
        vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
            resolvedOptions: () => ({ timeZone: "America/New_York" }),
        });

        expect(getUserTimezone()).toBe("America/New_York");
    });
});