import { describe, it, expect, vi } from "vitest";
import generateSchedule from "../savePlan";
import { api } from "../../api";

vi.mock("../../api", () => ({
    api: {
        post: vi.fn()
    }
}));

describe("savePlan", () => {

    it("calls api.post with correct URL and data", async () => {
        const mockData = { test: "data" };

        api.post.mockResolvedValue({ data: {} });

        await generateSchedule(mockData);

        expect(api.post).toHaveBeenCalledWith(
            "/api/plans/save/",
            mockData
        );
    });

});