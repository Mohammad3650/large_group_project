import axios from "axios";

export function formatApiError(err) {
  const out = { fieldErrors: {}, global: [] };

  if (!axios.isAxiosError(err)) {
    out.global = ["Something went wrong."];
    return out;
  }

  const data = err.response?.data;

  if (!data) {
    out.global = ["No response from server."];
    return out;
  }

  // DRF common: { detail: "..." }
  if (typeof data === "object" && typeof data.detail === "string") {
    out.global = [data.detail];
    return out;
  }

  if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (key === "non_field_errors") {
        out.global.push(...(Array.isArray(value) ? value : [String(value)]));
      } else {
        out.fieldErrors[key] = Array.isArray(value) ? value : [String(value)];
      }
    }

    if (!out.global.length && !Object.keys(out.fieldErrors).length) {
      out.global = ["Request failed."];
    }
    return out;
  }

  out.global = [typeof data === "string" ? data : "Request failed."];
  return out;
}