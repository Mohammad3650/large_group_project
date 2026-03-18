import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useUsername from "../useUsername";
import * as apiModule from "../../api.js";

vi.mock("../../api.js", () => ({
    api: {
        get: vi.fn(),
    },
}));

describe("useUsername", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initialises with an empty string", () => {
        const { result } = renderHook(() => useUsername(false));
        expect(result.current).toBe("");
    });

    it("does not fetch the username when the user is not logged in", () => {
        renderHook(() => useUsername(false));
        expect(apiModule.api.get).not.toHaveBeenCalled();
    });

    it("fetches and returns the username when the user is logged in", async () => {
        apiModule.api.get.mockResolvedValue({ data: { username: "testuser" } });

        const { result } = renderHook(() => useUsername(true));

        await waitFor(() => expect(result.current).toBe("testuser"));
        expect(apiModule.api.get).toHaveBeenCalledWith("/api/user/");
    });

    it("logs an error and keeps the username as an empty string when the API call fails", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        apiModule.api.get.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useUsername(true));

        await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
        expect(result.current).toBe("");
        expect(consoleSpy).toHaveBeenCalledWith("Failed to load user", expect.any(Error));

        consoleSpy.mockRestore();
    });

    it("fetches the username when isLoggedIn changes from false to true", async () => {
        apiModule.api.get.mockResolvedValue({ data: { username: "testuser" } });

        const { result, rerender } = renderHook(({ isLoggedIn }) => useUsername(isLoggedIn), {
            initialProps: { isLoggedIn: false },
        });

        expect(result.current).toBe("");
        expect(apiModule.api.get).not.toHaveBeenCalled();

        rerender({ isLoggedIn: true });

        await waitFor(() => expect(result.current).toBe("testuser"));
        expect(apiModule.api.get).toHaveBeenCalledWith("/api/user/");
    });
});