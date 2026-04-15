import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fetchGeneratedSchedule from "../../../utils/Api/fetchGeneratedSchedule";

vi.mock("../../../../../utils/Helpers/mapTimeBlocks.js", () => ({
    default: vi.fn((items) => items.map((item) => ({ ...item, mapped: true }))),
}));

import mapTimeBlocks from "../../../../../utils/Helpers/mapTimeBlocks.js";

describe("fetchGeneratedSchedule", () => {
    beforeEach(() => {
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        sessionStorage.clear();
    });

    it("returns null when there is no generated schedule", () => {
        expect(fetchGeneratedSchedule()).toBeNull();
    });

    it("returns mapped blocks and schedule when generatedSchedule exists", () => {
        const schedule = {
            events: [{ id: 1, name: "Event 1" }],
            scheduled: [{ id: 2, name: "Scheduled 1" }],
        };
        sessionStorage.setItem("generatedSchedule", JSON.stringify(schedule));

        const result = fetchGeneratedSchedule();

        expect(result).not.toBeNull();
        expect(result.schedule).toEqual(schedule);
        expect(mapTimeBlocks).toHaveBeenCalledWith([...schedule.events, ...schedule.scheduled]);
        expect(result.blocks).toEqual([
            { id: 1, name: "Event 1", mapped: true },
            { id: 2, name: "Scheduled 1", mapped: true },
        ]);
    });
});
