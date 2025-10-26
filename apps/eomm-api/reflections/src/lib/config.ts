const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

export type LiveConfig = {
  demo_mode: boolean;
  gic_per_private: number;
  gic_per_publish: number;
  reward_min_len: number;
  service: string;
};

export async function fetchLiveConfig(): Promise<LiveConfig | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/config`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as LiveConfig;
  } catch {
    return null;
  }
}

