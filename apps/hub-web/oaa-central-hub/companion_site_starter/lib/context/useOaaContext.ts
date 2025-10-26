import { useEffect, useState } from "react";
import type { OaaContext } from "./types";

type State =
  | { status: "idle" | "loading" }
  | { status: "ready"; data: OaaContext }
  | { status: "error"; error: string };

export function useOaaContext() {
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ status: "loading" });
        const r = await fetch("/api/oaa/context", { cache: "no-store" });
        if (!r.ok) throw new Error(`http_${r.status}`);
        const data = (await r.json()) as OaaContext;
        if (alive) setState({ status: "ready", data });
      } catch (e: any) {
        if (alive) setState({ status: "error", error: e?.message || "load_failed" });
      }
    })();
    return () => { alive = false; };
  }, []);

  return state;
}

