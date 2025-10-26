/**
 * authedFetchJSON
 * - Sends JSON defaults
 * - Always includes credentials (iron-session cookie)
 * - Adds Authorization: Bearer <token> if present in localStorage (optional)
 */
export function authedFetchJSON(input: RequestInfo | URL, init?: RequestInit) {
  const headers: Record<string,string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string,string> || {})
  };
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    if (token && !headers["Authorization"]) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  return fetch(input, { ...init, headers, credentials: "include" });
}

