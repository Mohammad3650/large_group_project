import { describe, it, expect, vi } from "vitest";
import deleteTimeBlock from "../Api/deleteTimeBlock.js";
import * as apiModule from "../../api.js";

vi.mock("../../api.js", () => ({
    api: {
        delete: vi.fn(),
    },
}));

describe("Tests for deleteTimeBlock", () => {
    it("throws an error when id is not provided", () => {
        expect(() => deleteTimeBlock(null)).toThrow("Invalid id");
    });

    it("throws an error when id is zero", () => {
        expect(() => deleteTimeBlock(0)).toThrow("Invalid id");
    });

    it("throws an error when id is undefined", () => {
        expect(() => deleteTimeBlock(undefined)).toThrow("Invalid id");
    });

    it("calls the correct API endpoint with the given ID", () => {
        deleteTimeBlock(42);
        expect(apiModule.api.delete).toHaveBeenCalledWith("/api/time-blocks/42/");
    });

    it("returns the response from the API call", async () => {
        const mockResponse = { status: 204 };
        apiModule.api.delete.mockResolvedValue(mockResponse);

        const result = deleteTimeBlock(42);
        await expect(result).resolves.toBe(mockResponse);
    });
});