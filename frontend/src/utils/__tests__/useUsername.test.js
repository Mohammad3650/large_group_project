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

    it("initialises with an empty username and no error", () => {
        const { result } = renderHook(() => useUsername(false));
        expect(result.current.username).toBe("");
        expect(result.current.error).toBe("");
    });

    it("does not fetch the username when the user is not logged in", () => {
        renderHook(() => useUsername(false));
        expect(apiModule.api.get).not.toHaveBeenCalled();
    });

    it("fetches and returns the username when the user is logged in", async () => {
        apiModule.api.get.mockResolvedValue({ data: { username: "testuser" } });

        const { result } = renderHook(() => useUsername(true));

        await waitFor(() => expect(result.current.username).toBe("testuser"));
        expect(apiModule.api.get).toHaveBeenCalledWith("/api/user/");
        expect(result.current.error).toBe("");
    });

    it("sets an error when the API call fails", async () => {
        apiModule.api.get.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useUsername(true));

        await waitFor(() => expect(result.current.error).toBe("Failed to load user"));
        expect(result.current.username).toBe("");
    });

    it("sets an error when the response contains no username", async () => {
        apiModule.api.get.mockResolvedValue({ data: {} });

        const { result } = renderHook(() => useUsername(true));

        await waitFor(() => expect(result.current.error).toBe("Invalid response from server"));
        expect(result.current.username).toBe("");
    });

    it("fetches the username when isLoggedIn changes from false to true", async () => {
        apiModule.api.get.mockResolvedValue({ data: { username: "testuser" } });

        const { result, rerender } = renderHook(({ isLoggedIn }) => useUsername(isLoggedIn), {
            initialProps: { isLoggedIn: false },
        });

        expect(result.current.username).toBe("");
        expect(apiModule.api.get).not.toHaveBeenCalled();

        rerender({ isLoggedIn: true });

        await waitFor(() => expect(result.current.username).toBe("testuser"));
        expect(apiModule.api.get).toHaveBeenCalledWith("/api/user/");
    });
});