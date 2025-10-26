import { useEffect } from "react";
import { refreshToken } from "./api";

export default function useTokenRefresh(intervalMs = 2 * 60 * 1000) {
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await refreshToken();
        if (res) {
          console.log("🔄 Token refreshed, exp:", res.exp);
        }
      } catch (err) {
        console.warn("Token refresh failed", err);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

