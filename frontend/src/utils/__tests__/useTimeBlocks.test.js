import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import useTimeBlocks from "../Hooks/useTimeBlocks";
import * as apiModule from "../../api.js";
import * as mapTimeBlocksModule from "../Helpers/mapTimeBlocks.js";

vi.mock("../../api.js", () => ({
    api: {
        get: vi.fn(),
    },
}));

vi.mock("../Helpers/mapTimeBlocks.js", () => ({
    default: vi.fn((blocks) => blocks),
}));

const mockBlocks = [
    { id: 1, name: "Lecture" },
    { id: 2, name: "Seminar" },
];

describe("Tests for useTimeBlocks", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initialises with null blocks and an empty error", () => {
        apiModule.api.get.mockImplementation(() => new Promise(() => {}));
        const { result } = renderHook(() => useTimeBlocks());
        expect(result.current.blocks).toBeNull();
        expect(result.current.error).toBe("");
    });

    it("fetches and maps time blocks on mount", async () => {
        apiModule.api.get.mockResolvedValue({ data: mockBlocks });
        mapTimeBlocksModule.default.mockReturnValue(mockBlocks);

        const { result } = renderHook(() => useTimeBlocks());

        await waitFor(() => expect(result.current.blocks).not.toBeNull());

        expect(apiModule.api.get).toHaveBeenCalledWith("/api/time-blocks/get/");
        expect(apiModule.api.get).toHaveBeenCalledTimes(1);
        expect(mapTimeBlocksModule.default).toHaveBeenCalledWith(mockBlocks);
        expect(result.current.blocks).toEqual(mockBlocks);
        expect(result.current.error).toBe("");
    });

    it("sets blocks to the mapped output, not the raw API response", async () => {
        const rawData = [{ id: 1, raw: true }];
        const mappedData = [{ id: 1, mapped: true }];

        apiModule.api.get.mockResolvedValue({ data: rawData });
        mapTimeBlocksModule.default.mockReturnValue(mappedData);

        const { result } = renderHook(() => useTimeBlocks());
        await waitFor(() => expect(result.current.blocks).toEqual(mappedData));
    });

    it("sets an error message when the API call fails", async () => {
        apiModule.api.get.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useTimeBlocks());

        await waitFor(() => expect(result.current.error).toBe("Failed to load time blocks"));

        expect(result.current.blocks).toBeNull();
    });

    it("updates blocks when setBlocks is called", async () => {
        apiModule.api.get.mockResolvedValue({ data: mockBlocks });

        const { result } = renderHook(() => useTimeBlocks());
        await waitFor(() => expect(result.current.blocks).not.toBeNull());

        const newBlocks = [{ id: 3, name: "Workshop" }];
        act(() => result.current.setBlocks(newBlocks));

        expect(result.current.blocks).toEqual(newBlocks);
    });
});