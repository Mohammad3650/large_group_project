import axios from "axios";

export function formatApiError(err) {
  if (!axios.isAxiosError(err)) {
    return ["Something went wrong."];
  }

  const data = err.response?.data;
  if (!data) return ["No response from server."];

  if (typeof data === "object" && typeof data.detail === "string") {
    return [data.detail];
  }

  if (typeof data === "object") {
    const parts = [];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) parts.push(...value);
      else if (typeof value === "string") parts.push(value);
      else parts.push(`${key}: ${JSON.stringify(value)}`);
    }
    if (parts.length) return parts;
  }

  return [typeof data === "string" ? data : JSON.stringify(data)];
}
