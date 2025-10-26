export async function adminFetch(path: string, token: string) {
  const base = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/,"");
  const res = await fetch(`${base}${path}`, { headers: { "x-admin-token": token } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

