"use client";
import { useState, useEffect } from "react";
import { saveReflection, anchorReflection } from "../lib/api";

type ChatBoxProps = {
  civicId: string;
  token: string;
  companion?: string; // e.g. "jade" | "eve"
};

export default function ChatBox({ civicId, token, companion = "jade" }: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const [ritualPrompt, setRitualPrompt] = useState<string | null>(null);
  const [log, setLog] = useState<{ from: string; text: string }[]>([]);

  // Companion rituals (morning / evening check-ins)
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) {
      setRitualPrompt("🌞 Good morning — what's your intention today?");
    } else if (hour >= 20) {
      setRitualPrompt("🌙 Before rest — what were your 3 wins and 1 tomorrow focus?");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message.trim();
    setLog((prev) => [...prev, { from: "You", text: userMsg }]);
    setMessage("");

    try {
      // Save into Lab4 memory - only pass the content
      await saveReflection(userMsg);

      // Anchor into Ledger - pass an object payload with all needed data
      await anchorReflection({
        civicId,
        content: userMsg,
        token,
        timestamp: new Date().toISOString()
      });

      // Companion auto-reply (simple placeholder now)
      const reply = `${companion} reflects: "I've saved this to your memory and Ledger. Do you feel lighter after writing that?"`;
      setLog((prev) => [...prev, { from: companion, text: reply }]);
    } catch (err) {
      console.error("Error saving reflection:", err);
      setLog((prev) => [...prev, { from: companion, text: "⚠️ I couldn't anchor that reflection. Try again." }]);
    }
  }

  return (
    <div className="chatbox">
      <div className="log">
        {ritualPrompt && (
          <div className="ritual">
            <strong>{companion} asks:</strong> {ritualPrompt}
          </div>
        )}
        {log.map((entry, i) => (
          <div key={i} className={`msg ${entry.from === "You" ? "user" : "companion"}`}>
            <strong>{entry.from}:</strong> {entry.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reflection…"
          className="chat-input"
        />
        <button type="submit" className="chat-send">Send</button>
      </form>
      <style jsx>{`
        .chatbox {
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 1rem;
        }
        .log {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 1rem;
        }
        .msg {
          margin: 0.5rem 0;
        }
        .msg.user {
          text-align: right;
          color: #333;
        }
        .msg.companion {
          text-align: left;
          color: #0066cc;
        }
        .ritual {
          margin: 1rem 0;
          font-style: italic;
          color: #444;
        }
        .chat-form {
          display: flex;
          gap: 0.5rem;
        }
        .chat-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #aaa;
          border-radius: 4px;
        }
        .chat-send {
          padding: 0.5rem 1rem;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
