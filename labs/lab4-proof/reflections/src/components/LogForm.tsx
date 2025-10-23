"use client";

import { useState } from "react";

type Props = {
  onSubmit: (note: string, publish: boolean) => Promise<void>;
};

export default function LogForm({ onSubmit }: Props) {
  const [note, setNote] = useState<string>("");
  const [publish, setPublish] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = note.trim();
    if (!clean) return;

    try {
      setBusy(true);
      await onSubmit(clean, publish);
      setNote(""); // clear after success
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: "#111",
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <label style={{ display: "block", marginBottom: 8, opacity: 0.8 }}>
        Daily Reflections
      </label>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="What did today teach you?"
        style={{
          width: "100%",
          background: "#0b0b0b",
          color: "#eeeeea",
          border: "1px solid #333",
          borderRadius: 8,
          padding: 10,
          outline: "none",
        }}
      />

      <div style={{ marginTop: 12 }}>
        <label style={{ userSelect: "none", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Publish this entry (earn a bonus when public sharing is enabled)
        </label>
      </div>

      <button
        type="submit"
        disabled={busy}
        style={{
          marginTop: 12,
          width: "100%",
          padding: 12,
          borderRadius: 10,
          background: busy ? "#2a2a2a" : "#36d97a",
          color: "#0b0b0b",
          fontWeight: 700,
          border: "none",
          cursor: busy ? "default" : "pointer",
        }}
      >
        {busy ? "Logging…" : "Log Reflection"}
      </button>
    </form>
  );
}
