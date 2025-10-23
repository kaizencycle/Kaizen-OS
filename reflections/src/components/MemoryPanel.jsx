// src/MemoryPanel.jsx
import { useEffect, useState } from "react";
import { memoryGet, memorySummarize } from "./api";

export default function MemoryPanel({ onClose }) {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await memoryGet();
      setEvents(data?.events || []);
      setSummary(data?.summary || "");
      setCount(data?.count || 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSummarize() {
    setSummarizing(true);
    try {
      const res = await memorySummarize();
      setSummary(res.summary || "");
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <div className="w-full md:w-96 h-full flex flex-col bg-white border-l">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">🧠 Memory</h2>
        <button onClick={onClose} className="text-sm px-2 py-1 rounded border hover:bg-gray-50">
          Close
        </button>
      </div>

      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Events</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{count}</span>
        </div>
        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500">No events yet.</p>
          ) : (
            events.slice().reverse().map((e, i) => (
              <div key={i} className="text-sm">
                <span className="mr-1 text-xs uppercase tracking-wide text-gray-500">
                  {e.type}
                </span>
                <span>{e.content}</span>
                <div className="text-[10px] text-gray-400">{e.ts}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Summary</h3>
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="text-xs px-2 py-1 rounded bg-indigo-600 text-white disabled:opacity-50"
          >
            {summarizing ? "Summarizing…" : "Summarize"}
          </button>
        </div>
        {summary ? (
          <p className="text-sm leading-relaxed">{summary}</p>
        ) : (
          <p className="text-sm text-gray-500">No summary yet. Click “Summarize”.</p>
        )}
      </div>

      <div className="p-3 border-t text-xs text-gray-500">
        Tip: press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>B</kbd> to toggle panel.
      </div>
    </div>
  );
}
