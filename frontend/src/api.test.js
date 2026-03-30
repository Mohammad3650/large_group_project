import { describe, it, expect, beforeEach, vi } from "vitest";

let apiModule;

describe("api config", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it("creates api and publicApi with the correct baseURL", async () => {
    apiModule = await import("./api");
    const expectedBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
    expect(apiModule.api.defaults.baseURL).toBe(expectedBase);
    expect(apiModule.publicApi.defaults.baseURL).toBe(expectedBase);
  });

  it("falls back to http://127.0.0.1:8000 when VITE_API_BASE_URL is not set", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "");
    apiModule = await import("./api");
    expect(apiModule.api.defaults.baseURL).toBe("http://127.0.0.1:8000");
    expect(apiModule.publicApi.defaults.baseURL).toBe("http://127.0.0.1:8000");
    vi.unstubAllEnvs();
  });

  it("sets the Authorization header when a token is provided", async () => {
    apiModule = await import("./api");

    apiModule.setAuthToken("my-token");

    expect(apiModule.api.defaults.headers.common.Authorization).toBe(
      "Bearer my-token"
    );
  });

  it("removes the Authorization header when no token is provided", async () => {
    apiModule = await import("./api");

    apiModule.setAuthToken("my-token");
    apiModule.setAuthToken(null);

    expect(apiModule.api.defaults.headers.common.Authorization).toBeUndefined();
  });

  it("loads token from localStorage on import", async () => {
    localStorage.setItem("access", "stored-token");

    apiModule = await import("./api");

    expect(apiModule.api.defaults.headers.common.Authorization).toBe(
      "Bearer stored-token"
    );
  });

  it("does not set Authorization header on import if no token exists", async () => {
    apiModule = await import("./api");

    expect(apiModule.api.defaults.headers.common.Authorization).toBeUndefined();
  });
});