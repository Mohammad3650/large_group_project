import { setAuthToken } from "../api";

export function getAccessToken() {
  return localStorage.getItem("access");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh");
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  setAuthToken(null);
}

export function saveTokens(access, refresh) {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
  setAuthToken(access);
}
