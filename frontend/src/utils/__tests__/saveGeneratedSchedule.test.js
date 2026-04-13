import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockTimezone = "America/New_York";

vi.mock("../Api/savePlan", () => ({
    default: vi.fn(),
}));

vi.mock("../Helpers/getUserTimezone", () => ({
    default: vi.fn(() => mockTimezone),
}));

import saveGeneratedSchedule from "../Api/saveGeneratedSchedule";
import savePlan from "../Api/savePlan";
import getUserTimezone from "../Helpers/getUserTimezone";

describe("saveGeneratedSchedule", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.Temporal = {
            ZonedDateTime: {
                from: vi.fn((isoString) => ({
                    withTimeZone: vi.fn(() => ({
                        toPlainDate: vi.fn(() => ({
                            toString: () => isoString.split("T")[0],
                        })),
                        toPlainTime: vi.fn(() => ({
                            toString: () => isoString.split("T")[1].replace("[UTC]", ""),
                        })),
                    })),
                })),
            },
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.Temporal;
    });

    it("calls savePlan with converted schedule data", async () => {
        const schedule = {
            week_start: "2026-04-14",
            events: [
                {
                    id: 1,
                    date: "2026-04-14",
                    start_time: "09:00",
                    end_time: "10:00",
                },
            ],
        };
        const navigate = vi.fn();

        await saveGeneratedSchedule(schedule, navigate);

        expect(savePlan).toHaveBeenCalledTimes(1);
    });

    it("navigates to dashboard after saving", async () => {
        const schedule = {
            week_start: "2026-04-14",
            events: [
                {
                    id: 2,
                    date: "2026-04-14",
                    start_time: "14:00",
                    end_time: "15:30",
                },
            ],
        };
        const navigate = vi.fn();

        await saveGeneratedSchedule(schedule, navigate);

        expect(navigate).toHaveBeenCalledWith("/dashboard");
    });

    it("uses the timezone helper before saving", async () => {
        const schedule = {
            week_start: "2026-04-14",
            events: [
                {
                    id: 3,
                    date: "2026-04-14",
                    start_time: "08:00",
                    end_time: "09:00",
                },
            ],
        };
        const navigate = vi.fn();

        await saveGeneratedSchedule(schedule, navigate);

        expect(getUserTimezone).toHaveBeenCalled();
    });
});
