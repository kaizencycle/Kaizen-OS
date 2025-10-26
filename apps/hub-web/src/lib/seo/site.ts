export function getSiteBaseUrl() {
  const v = process.env.HUB_BASE_URL || "";
  return v.endsWith("/") ? v.slice(0,-1) : v || "http://localhost:3000";
}


