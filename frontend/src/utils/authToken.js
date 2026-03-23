import { publicApi } from "../api";
import { getAccessToken, logout } from "./handleLocalStorage";

// Helper function to verify the token with the backend
async function verifyToken(token) {
  await publicApi.post("/api/token/verify/", { token });
}

/**
 * Checks whether the currently stored access token is still valid.
 *
 * 
 * -- Reads the access token from local storage
 * -- Returns false immediately if no token exists
 * -- Sends the token to the backend verification endpoint
 * -- Returns true if verification succeeds
 * -- Logs the user out and returns false if verification fails
 *
 * 
 * @returns True if the token is valid, false otherwise
 */

export async function isTokenValid() {
  const token = getAccessToken();
  // If there's no token, it's not valid
  if (!token) return false;


  try {
    await verifyToken(token);
    return true;
  } catch {
    logout();
    return false;
  }
}