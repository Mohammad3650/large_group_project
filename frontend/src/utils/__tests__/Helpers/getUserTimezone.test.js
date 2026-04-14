import { describe, it, expect, vi, afterEach } from "vitest";
import getUserTimezone from "../../Helpers/getUserTimezone.js";

const mockTimezone = (timezone) => {
    return vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
        resolvedOptions: () => ({ timeZone: timezone }),
    });
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe("Tests for getUserTimezone", () => {
    it("returns the timezone from Intl.DateTimeFormat resolvedOptions", () => {
        mockTimezone("Europe/London");

        expect(getUserTimezone()).toBe("Europe/London");
    });

    it("returns a different timezone when the system timezone changes", () => {
        mockTimezone("America/New_York");

        expect(getUserTimezone()).toBe("America/New_York");
    });

    it("calls Intl.DateTimeFormat to retrieve the timezone", () => {
        const spy = mockTimezone("Europe/London");

        getUserTimezone();

        expect(spy).toHaveBeenCalled();
    });
});