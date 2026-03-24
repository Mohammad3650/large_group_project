import { describe, it, expect, vi } from "vitest";
import generateSchedule from "../generateSchedule";
import { api } from "../../api";

vi.mock("../../api", () => ({
    api: {
        post: vi.fn()
    }
}));

describe("generateSchedule", () => {

    it("calls api.post with correct URL and data", async () => {
        const mockData = { test: "data" };

        api.post.mockResolvedValue({ data: {} });

        await generateSchedule(mockData);

        expect(api.post).toHaveBeenCalledWith(
            "/schedule/generates/",
            mockData
        );
    });

    it("returns response data", async () => {
        const mockResponse = { events: [ 1, 2, 3 ] } ;

        api.post.mockResolvedValue({ data: mockResponse });

        const result = await generateSchedule({});

        expect(result.data).toEqual(mockResponse);
    });

});