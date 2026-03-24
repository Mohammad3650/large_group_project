import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useTimeBlocks from "../useTimeBlocks";
import * as apiModule from "../../api.js";
import * as mapTimeBlocksModule from "../mapTimeBlocks.js";
import {act} from "react";

vi.mock("../../api.js", () => ({
    api: {
        get: vi.fn(),
    },
}));

vi.mock("../mapTimeBlocks.js", () => ({
    default: vi.fn((blocks) => blocks),
}));

const mockBlocks = [
    { id: 1, name: "Lecture" },
    { id: 2, name: "Seminar" },
];

describe("useTimeBlocks", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initialises with null blocks and an empty error", () => {
        apiModule.api.get.mockResolvedValue({ data: [] });
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
        expect(mapTimeBlocksModule.default).toHaveBeenCalledWith(mockBlocks);
        expect(result.current.blocks).toEqual(mockBlocks);
        expect(result.current.error).toBe("");
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