import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import discardSchedule from "../../../utils/Helpers/discardSchedule.js";

describe("discardSchedule", () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.setItem("generatedSchedule", "test-data");
    });

    afterEach(() => {
        sessionStorage.removeItem("generatedSchedule");
    });

    it("removes the generated schedule from sessionStorage", () => {
        expect(sessionStorage.getItem("generatedSchedule")).toBe("test-data");

        discardSchedule(mockNavigate);

        expect(sessionStorage.getItem("generatedSchedule")).toBeNull();
    });

    it("navigates to the dashboard after discarding", () => {
        discardSchedule(mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
});
