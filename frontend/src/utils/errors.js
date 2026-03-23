import axios from "axios";

/**
 * Converts API errors into a consistent structure for the frontend.
 *
 * Returned structure:
 * -- fieldErrors: maps field names to an array of messages
 * -- global: array of general error messages not tied to one field
 *
 * Handles several common cases:
 * -- non-Axios errors
 * -- missing server response
 * -- DRF "detail" responses
 * -- DRF field validation errors
 * -- DRF non_field_errors
 * -- plain string responses
 *
 * @param {unknown} err - Error thrown during an API request
 * @returns {{ fieldErrors: Object<string, string[]>, global: string[] }}
 */

export function formatApiError(err) {
  const out = { fieldErrors: {}, global: [] };

  // If the error is not from Axios, return a generic fallback message
  if (!axios.isAxiosError(err)) {
    out.global = ["Something went wrong."];
    return out;
  }
  
  // Extract response data from the Axios error if available
  const data = err.response?.data;

  // If the request failed without any response data, show a server fallback message
  if (!data) {
    out.global = ["No response from server."];
    return out;
  }

  // DRF common: { detail: "..." }
  if (typeof data === "object" && typeof data.detail === "string") {
    out.global = [data.detail];
    return out;
  }

  // Handle structured validation errors returned as an object
  if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (key === "non_field_errors") {
        // Add general validation errors to the global array
        out.global.push(...(Array.isArray(value) ? value : [String(value)]));
      } else {
        // Store field-specific errors under their field name
        out.fieldErrors[key] = Array.isArray(value) ? value : [String(value)];
      }
    }

    // Fallback if the object exists but contains no usable errors
    if (!out.global.length && !Object.keys(out.fieldErrors).length) {
      out.global = ["Request failed."];
    }

    return out;
  }

  // Handle string or unexpected primitive response types
  out.global = [typeof data === "string" ? data : "Request failed."];
  return out;
}