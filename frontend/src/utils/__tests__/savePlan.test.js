import { describe, it, expect, vi } from "vitest";
import savePlan from "../Api/savePlan";
import { api } from "../../api";

vi.mock("../../api", () => ({
    api: {
        post: vi.fn()
    }
}));

describe("Tests for savePlan", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls api.post with correct URL and data", async () => {
        const mockData = { test: "data" };

        api.post.mockResolvedValue({ data: {} });

        await savePlan(mockData);

        expect(api.post).toHaveBeenCalledWith(
            "/api/plans/save/",
            mockData
        );
    });

});