import { useEffect, useState } from "react";
import { isTokenValid } from "./authToken";

/**
 * Custom hook to determine whether a user is authenticated.
 *
 * Responsibilities:
 * - checks token validity on mount
 * - stores login state
 * - provides reusable auth status across components
 *
 * @returns {boolean} isLoggedIn - whether the user is authenticated
 */

function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const valid = await isTokenValid();
      setIsLoggedIn(valid);
    }

    checkAuth();
  }, []);

  return isLoggedIn;
}

export default useAuthStatus;