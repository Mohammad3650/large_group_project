import { publicApi } from "../api";
import { getAccessToken, logout } from "./handleLocalStorage";

async function verifyToken(token) {
  await publicApi.post("/api/token/verify/", { token });
}

export async function isTokenValid() {
  const token = getAccessToken();
  if (!token) return false;

  try {
    await verifyToken(token);
    return true;
  } catch {
    logout();
    return false;
  }
}