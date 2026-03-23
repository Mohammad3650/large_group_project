import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { formatApiError } from "../errors";

describe("formatApiError", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a generic message for non-Axios errors", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(false);

    const result = formatApiError(new Error("Something broke"));

    expect(result).toEqual({
      fieldErrors: {},
      global: ["Something went wrong."],
    });
  });

  it("returns a no-response message when Axios error has no response data", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const error = {
      response: undefined,
    };

    const result = formatApiError(error);

    expect(result).toEqual({
      fieldErrors: {},
      global: ["No response from server."],
    });
  });

  it("returns the DRF detail message as a global error", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const error = {
      response: {
        data: {
          detail: "Invalid token.",
        },
      },
    };

    const result = formatApiError(error);

    expect(result).toEqual({
      fieldErrors: {},
      global: ["Invalid token."],
    });
  });

  it("maps field errors and non_field_errors correctly", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const error = {
      response: {
        data: {
          email: ["Email is already in use."],
          password: ["Password is too short."],
          non_field_errors: ["Unable to log in with provided credentials."],
        },
      },
    };

    const result = formatApiError(error);

    expect(result).toEqual({
      fieldErrors: {
        email: ["Email is already in use."],
        password: ["Password is too short."],
      },
      global: ["Unable to log in with provided credentials."],
    });
  });

  it("converts non-array field errors into arrays", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const error = {
      response: {
        data: {
          email: "Email is required.",
        },
      },
    };

    const result = formatApiError(error);

    expect(result).toEqual({
      fieldErrors: {
        email: ["Email is required."],
      },
      global: [],
    });
  });

  it("converts non-array non_field_errors into an array", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const error = {
      response: {
        data: {
          non_field_errors: "General validation failure.",
        },
      },
    };

    const result = formatApiError(error);

    expect(result).toEqual({
      fieldErrors: {},
      global: ["General validation failure."],
    });
  });

  it("returns a fallback message when the error object is empty", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const error = {
      response: {
        data: {},
      },
    };

    const result = formatApiError(error);

    expect(result).toEqual({
      fieldErrors: {},
      global: ["Request failed."],
    });
  });

  it("returns a string response as a global error", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const error = {
      response: {
        data: "Server unavailable.",
      },
    };

    const result = formatApiError(error);

    expect(result).toEqual({
      fieldErrors: {},
      global: ["Server unavailable."],
    });
  });

  it("returns a fallback message for unexpected primitive response data", () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const error = {
      response: {
        data: 500,
      },
    };

    const result = formatApiError(error);

    expect(result).toEqual({
      fieldErrors: {},
      global: ["Request failed."],
    });
  });
});