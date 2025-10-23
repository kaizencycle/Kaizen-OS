// src/SessionBadge.jsx
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://hive-api-2le8.onrender.com";

export default function SessionBadge() {
  const [admin, setAdmin] = useState(null);
  const [left, setLeft] = useState(null); // seconds

  async function fetchStatus() {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    const res = await fetch(`${API_BASE}/admin/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.ok) {
      setAdmin(data.admin);
      setLeft(data.expires_in_seconds);
    } else {
      setAdmin(null);
      setLeft(null);
    }
  }

  useEffect(() => {
    fetchStatus();
    const tick = setInterval(() => {
      setLeft((s) => (typeof s === "number" ? Math.max(0, s - 1) : s));
    }, 1000);
    const poll = setInterval(fetchStatus, 30_000); // refresh every 30s
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  if (!admin) return null;

  const mins = Math.floor((left ?? 0) / 60);
  const secs = (left ?? 0) % 60;

  return (
    <div className="fixed top-3 right-3 z-50 bg-black/80 text-white text-xs px-3 py-2 rounded shadow">
      <div className="font-medium">🔒 {admin}</div>
      <div className="opacity-80">{mins}:{secs.toString().padStart(2, "0")} left</div>
    </div>
  );
}

import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://hive-api-2le8.onrender.com";

export default function SessionBadge() {
  const [admin, setAdmin] = useState(null);
  const [left, setLeft] = useState(null); // seconds
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const masked = token ? token.slice(0, 6) + "…" + token.slice(-6) : "";

  async function fetchStatus() {
    if (!token) return;
    const res = await fetch(`${API_BASE}/admin/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.ok) {
      setAdmin(data.admin);
      setLeft(data.expires_in_seconds);
    } else {
      setAdmin(null);
      setLeft(null);
    }
  }

  async function copyToken() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = token;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  useEffect(() => {
    fetchStatus();
    const tick = setInterval(() => {
      setLeft((s) => (typeof s === "number" ? Math.max(0, s - 1) : s));
    }, 1000);
    const poll = setInterval(fetchStatus, 30_000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  if (!admin) return null;

  const mins = Math.floor((left ?? 0) / 60);
  const secs = (left ?? 0) % 60;

  return (
    <div className="fixed top-3 right-3 z-50 bg-black/80 text-white text-xs px-3 py-2 rounded shadow max-w-[75vw]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">🔒 {admin}</div>
          <div className="opacity-80">{mins}:{secs.toString().padStart(2, "0")} left</div>
        </div>

        {/* token controls */}
        {token && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowToken((v) => !v)}
              className="border border-white/30 px-2 py-0.5 rounded hover:bg-white/10"
              title={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? "🙈 Hide" : "👁 Show"}
            </button>
            <button
              onClick={copyToken}
              className="bg-white text-black px-2 py-0.5 rounded hover:bg-gray-100"
              title="Copy token"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {showToken && token && (
        <div className="mt-2 p-2 bg-white/10 rounded break-all">
          <div className="opacity-80 mb-1">Session token</div>
          <code className="text-[10px]">
            {token}
          </code>
        </div>
      )}

      {!showToken && token && (
        <div className="mt-1 opacity-70 truncate">token: {masked}</div>
      )}
    </div>
  );
}
