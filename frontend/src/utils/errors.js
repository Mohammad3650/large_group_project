import axios from "axios";

export function formatApiError(err) {
  if (!axios.isAxiosError(err)) {
    return ["Something went wrong."];
  }

  const data = err.response?.data;

  if (!data) {
    return ["No response from server."];
  }

  // Case 1: { detail: "..." }
  if (typeof data === "object" && typeof data.detail === "string") {
    return [data.detail];
  }

  // Case 2: Field errors like { email: ["msg"], password: ["msg"] }
  if (typeof data === "object") {
    const parts = [];

    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        parts.push(...value); // just push messages
      } else if (typeof value === "string") {
        parts.push(value);
      }
    }

    if (parts.length) {
      return parts;
    }
  }

  // Fallback
  if (typeof data === "string") {
    return [data];
  }

  return [JSON.stringify(data)];
}
