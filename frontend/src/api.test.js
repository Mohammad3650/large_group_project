import { describe, it, expect, beforeEach, vi } from "vitest";

let apiModule;

describe("api config", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it("creates api and publicApi with the correct baseURL", async () => {
    apiModule = await import("./api");

    expect(apiModule.api.defaults.baseURL).toBe("https://hamzakhan887.pythonanywhere.com");
    expect(apiModule.publicApi.defaults.baseURL).toBe("https://hamzakhan887.pythonanywhere.com");
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