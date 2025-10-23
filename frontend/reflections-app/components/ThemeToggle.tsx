"use client";
import { useEffect, useState } from "react";

const KEY = "oaa.hub.theme";
type Theme = "light" | "dark";

export default function ThemeToggle({ onChange }: { onChange?: (t: Theme) => void }) {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(KEY)) as Theme | null;
    if (saved) setTheme(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, theme);
    onChange?.(theme);
  }, [theme, onChange]);
  return (
    <button
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      style={{
        border: "1px solid #334155",
        background: theme === "dark" ? "#0f172a" : "white",
        color: theme === "dark" ? "white" : "#0f172a",
        borderRadius: 20,
        padding: "6px 10px",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
