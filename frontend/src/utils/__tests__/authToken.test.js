import { describe, it, expect, vi, beforeEach } from "vitest";
import { isTokenValid } from "../authToken";
import * as apiModule from "../../api";
import * as storageModule from "../authStorage";

vi.mock("../../api", () => ({
  publicApi: {
    post: vi.fn(),
  },
}));

vi.mock("../authStorage", () => ({
  getAccessToken: vi.fn(),
  logout: vi.fn(),
}));

describe("Tests for isTokenValid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false if no token is stored", async () => {
    storageModule.getAccessToken.mockReturnValue(null);

    const result = await isTokenValid();

    expect(result).toBe(false);
    expect(apiModule.publicApi.post).not.toHaveBeenCalled();
  });

  it("returns true when token verification succeeds", async () => {
    storageModule.getAccessToken.mockReturnValue("valid-token");
    apiModule.publicApi.post.mockResolvedValue({});

    const result = await isTokenValid();

    expect(apiModule.publicApi.post).toHaveBeenCalledWith(
      "/api/token/verify/",
      { token: "valid-token" }
    );
    expect(result).toBe(true);
    expect(storageModule.logout).not.toHaveBeenCalled();
  });

  it("logs out and returns false when token verification fails", async () => {
    storageModule.getAccessToken.mockReturnValue("invalid-token");
    apiModule.publicApi.post.mockRejectedValue({
      response: { status: 401 },
    });

    const result = await isTokenValid();

    expect(apiModule.publicApi.post).toHaveBeenCalledWith(
      "/api/token/verify/",
      { token: "invalid-token" }
    );
    expect(storageModule.logout).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("returns false without logging out on network/server errors", async () => {
  storageModule.getAccessToken.mockReturnValue("some-token");
  apiModule.publicApi.post.mockRejectedValue(new Error("Network error"));

  const result = await isTokenValid();

  expect(apiModule.publicApi.post).toHaveBeenCalledWith(
    "/api/token/verify/",
    { token: "some-token" }
  );
  expect(storageModule.logout).not.toHaveBeenCalled();
  expect(result).toBe(false);
});

  it("calls the verify endpoint with the correct token", async () => {
    storageModule.getAccessToken.mockReturnValue("test-token");
    apiModule.publicApi.post.mockResolvedValue({});

    await isTokenValid();

    expect(apiModule.publicApi.post).toHaveBeenCalledWith(
      "/api/token/verify/",
      { token: "test-token" }
    );
  });
});