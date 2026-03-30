import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAccessToken,
  getRefreshToken,
  logout,
  saveTokens,
} from "../Auth/authStorage";
import * as apiModule from "../../api";

vi.mock("../../api", () => ({
  setAuthToken: vi.fn(),
}));

const setTokens = ({ access, refresh } = {}) => {
  if (access !== undefined) localStorage.setItem("access", access);
  if (refresh !== undefined) localStorage.setItem("refresh", refresh);
};

describe("Tests for authStorage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("returns the stored access token", () => {
        setTokens({ access: "test-access" });


        const result = getAccessToken();

        expect(result).toBe("test-access");
    });

    it("returns the stored refresh token", () => {
        setTokens({ refresh: "test-refresh" });

        const result = getRefreshToken();

        expect(result).toBe("test-refresh");
    });

    it("returns null if tokens are not present", () => {
        expect(getAccessToken()).toBeNull();
        expect(getRefreshToken()).toBeNull();
    });

    it("saves tokens to localStorage and sets auth header", () => {
        saveTokens("access-token", "refresh-token");

        expect(localStorage.getItem("access")).toBe("access-token");
        expect(localStorage.getItem("refresh")).toBe("refresh-token");

        expect(apiModule.setAuthToken).toHaveBeenCalledWith("access-token");
    });

    it("removes tokens from localStorage and clears auth header on logout", () => {
        setTokens({ access: "access-token", refresh: "refresh-token" });

        logout();

        expect(localStorage.getItem("access")).toBeNull();
        expect(localStorage.getItem("refresh")).toBeNull();

        expect(apiModule.setAuthToken).toHaveBeenCalledWith(null);
    });
});