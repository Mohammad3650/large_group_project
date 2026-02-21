import { publicApi } from "../api";
import { getAccessToken, logout } from "./handleLocalStorage";

export async function isTokenValid() {
    const token = getAccessToken();

    if (!token) return false;

    try {
        await publicApi.post("/api/token/verify/", { token });
        return true;
    } catch {
        logout();
        return false;
    }
    
}