"use client";
import { useEffect, useRef, useState } from "react";
import SubjectList from "../../components/SubjectList";
import ThemeToggle from "../../components/ThemeToggle";

type Msg = { role: "user" | "assistant" | "system"; content: string; meta?: any };
type HubReply = { role: "assistant"; content: string; sources?: { mentor: string; preview: string }[]; session_id?: string };

const DEFAULT_MENTORS = ["gemini", "claude", "deepseek", "perplexity"];
const HUB_TITLE = process.env.NEXT_PUBLIC_HUB_TITLE || "OAA Assistant";

export default function HubPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "system", content: "You are the OAA Assistant. Answer succinctly; mention mentors when useful." }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [model, setModel] = useState<string>("ensemble");
  const [mentors, setMentors] = useState<string[]>([...DEFAULT_MENTORS]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  // Mobile detection and sidebar management
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  async function send() {
    if (!input.trim() || sending) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/hub/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          user_id: "hub",
          messages: [...messages, userMsg].filter((x) => x.role !== "system"),
          model,
          mentors,
          system: messages.find((x) => x.role === "system")?.content
        })
      });
      const data: HubReply | { error: string } = await res.json();
      if ((data as any).error) throw new Error((data as any).error);
      const reply = data as HubReply;

      // progressive rendering (feels like stream)
      const full = reply.content || "";
      let drafted = "";
      const chunks = full.split(/(\. |\n)/); // rough
      for (const c of chunks) {
        drafted += c;
        setMessages((m) => [...m.slice(0, -0), { role: "assistant", content: drafted } as Msg]);
        // tiny delay to mimic streaming
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 10));
      }
      // attach sources
      if (reply.sources && reply.sources.length > 0) {
        const sources = reply.sources;
        setMessages((m) => [...m, { role: "assistant", content: renderSources(sources), meta: { sources } }]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${e.message || "Hub error"}` }]);
    } finally {
      setSending(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function renderSources(sources: { mentor: string; preview: string }[]) {
    const lines = sources.map((s) => `- **${s.mentor}**: ${s.preview}…`);
    return `**Mentor sources**\n${lines.join("\n")}`;
  }

  function toggleMentor(name: string) {
    setMentors((cur) => (cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]));
  }

  function pickSubjectPrompt(text: string) {
    // prefill + send
    setInput(text);
    setTimeout(() => send(), 10);
  }

  const t = themeVars(theme);
  return (
    <div style={{ ...wrap, background: t.shellBg }} className="hub-container">
      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div 
          className="mobile-overlay open"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        style={{ 
          ...side, 
          background: t.sideBg, 
          color: t.sideFg, 
          borderRight: `1px solid ${t.sideBorder}`,
          ...(isMobile ? mobileSidebarStyle : {})
        }}
        className={`hub-sidebar ${isMobile ? `mobile-sidebar ${mobileSidebarOpen ? 'open' : ''}` : ''}`}
      >
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
          OAA Central Hub
          {isMobile && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              style={closeButton}
              className="touch-target"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>
        <SubjectList onPick={pickSubjectPrompt} />
        <div style={{ opacity: 0.7, marginBottom: 16 }}>Models</div>
        <div style={{ display: "grid", gap: 6 }}>
          {["ensemble", "gemini", "claude", "deepseek", "perplexity"].map((m) => (
            <button key={m} onClick={() => setModel(m)} style={chip(model === m, t)}>{m}</button>
          ))}
        </div>
        <div style={{ height: 1, background: "#eee", margin: "16px 0" }} />
        <div style={{ opacity: 0.7, marginBottom: 8 }}>Mentor Ensemble</div>
        <div style={{ display: "grid", gap: 6 }}>
          {DEFAULT_MENTORS.map((m) => (
            <label key={m} style={mentorRow}>
              <input
                type="checkbox"
                checked={mentors.includes(m)}
                onChange={() => toggleMentor(m)}
              />
              <span style={{ textTransform: "capitalize" }}>{m}</span>
            </label>
          ))}
        </div>
        <div style={{ height: 1, background: "#eee", margin: "16px 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Hub: {HUB_TITLE}</div>
          <ThemeToggle onChange={setTheme} />
        </div>
      </aside>

      {/* Main */}
      <main style={{ ...main, background: t.mainBg, color: t.mainFg }} className="hub-main">
        <header style={{ ...topbar, borderBottom: `1px solid ${t.barBorder}`, background: t.barBg, color: t.barFg }} className="hub-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button
                onClick={() => setMobileSidebarOpen(true)}
                style={hamburgerButton}
                className="touch-target"
                aria-label="Open sidebar"
              >
                <div className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>
            )}
            <div style={{ fontWeight: 700 }}>{HUB_TITLE}</div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Mode: {model}</div>
        </header>

        <div style={{ ...chat, background: t.chatBg }} className="hub-chat mobile-chat">
          {messages.map((m, i) => (
            <div key={i} style={bubble(m.role, t)} className="hub-bubble mobile-bubble">
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{m.role}</div>
              <pre style={pre(t)}>{m.content}</pre>
            </div>
          ))}
          {sending && <div style={{ ...bubble("assistant", t), opacity: 0.6 }} className="hub-bubble mobile-bubble">…</div>}
          <div ref={bottomRef} />
        </div>

        <div style={{ ...composer, background: t.mainBg, borderTop: `1px solid ${t.barBorder}` }} className="hub-composer mobile-composer">
          <textarea
            style={ta(t)}
            className="hub-textarea mobile-textarea"
            rows={isMobile ? 2 : 3}
            placeholder="Ask OAA… (Shift+Enter = newline)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <button 
            style={sendBtn(t)} 
            className="hub-send-btn mobile-button touch-target"
            disabled={!input.trim() || sending} 
            onClick={send}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </main>
    </div>
  );
}

/* ---------- styles ---------- */
const wrap: React.CSSProperties = { 
  display: "grid", 
  gridTemplateColumns: "280px 1fr", 
  height: "100vh"
};

const side: React.CSSProperties = { 
  padding: 16, 
  overflow: "auto"
};

const mobileSidebarStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: "-100%",
  width: "280px",
  height: "100vh",
  zIndex: 1000,
  transition: "left 0.3s ease-in-out",
  padding: 16,
  overflow: "auto"
};

const main: React.CSSProperties = { 
  display: "grid", 
  gridTemplateRows: "56px 1fr auto"
};

const topbar: React.CSSProperties = { 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "space-between", 
  padding: "0 16px" 
};

const chat: React.CSSProperties = { 
  padding: 16, 
  overflow: "auto"
};

const composer: React.CSSProperties = { 
  display: "grid", 
  gridTemplateColumns: "1fr 120px", 
  gap: 8, 
  padding: 12
};
const ta = (t: ThemeVars): React.CSSProperties => ({ border: `1px solid ${t.inputBorder}`, borderRadius: 10, padding: 12, fontSize: 14, background: t.inputBg, color: t.inputFg, resize: "vertical" });
const sendBtn = (t: ThemeVars): React.CSSProperties => ({ border: `1px solid ${t.btnBorder}`, background: t.btnBg, color: t.btnFg, borderRadius: 10, fontWeight: 700, cursor: "pointer" });
const bubble = (role: "user" | "assistant" | "system", t: ThemeVars): React.CSSProperties => ({
  background: role === "user" ? t.bubbleUserBg : role === "assistant" ? t.bubbleAssistantBg : t.bubbleSystemBg,
  border: `1px solid ${t.bubbleBorder}`,
  borderRadius: 10,
  padding: "10px 12px",
  marginBottom: 10,
  color: t.bubbleFg,
  lineHeight: 1.5,
});
const pre = (t: ThemeVars): React.CSSProperties => ({
  whiteSpace: "pre-wrap",
  margin: 0,
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, sans-serif",
  fontSize: 14,
  color: t.textFg,
});
const chip = (active: boolean, t: ThemeVars): React.CSSProperties => ({
  textAlign: "left",
  border: `1px solid ${t.chipBorder}`,
  background: active ? t.chipActiveBg : t.chipBg,
  color: t.chipFg,
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  textTransform: "capitalize"
});
const mentorRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontSize: 14 };

const hamburgerButton: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "44px",
  minWidth: "44px"
};

const hamburgerIcon = (isOpen: boolean): React.CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  width: "20px",
  height: "16px"
});

const closeButton: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  fontSize: "20px",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "44px",
  minWidth: "44px"
};

/* ---------- theme ---------- */
type ThemeVars = {
  shellBg: string; sideBg: string; sideFg: string; sideBorder: string;
  mainBg: string; mainFg: string; barBg: string; barFg: string; barBorder: string; chatBg: string;
  inputBg: string; inputFg: string; inputBorder: string; btnBg: string; btnFg: string; btnBorder: string;
  bubbleUserBg: string; bubbleAssistantBg: string; bubbleSystemBg: string; bubbleBorder: string; bubbleFg: string; textFg: string;
  chipBg: string; chipActiveBg: string; chipBorder: string; chipFg: string;
};
function themeVars(mode: "light" | "dark"): ThemeVars {
  if (mode === "dark") {
    return {
      shellBg: "#0b1225", sideBg: "#0b1225", sideFg: "white", sideBorder: "#1e293b",
      mainBg: "#0f172a", mainFg: "white", barBg: "#0b1225", barFg: "white", barBorder: "#1e293b", chatBg: "#0f172a",
      inputBg: "#0f172a", inputFg: "white", inputBorder: "#334155",
      btnBg: "#1e293b", btnFg: "white", btnBorder: "#334155",
      bubbleUserBg: "#111827", bubbleAssistantBg: "#1f2937", bubbleSystemBg: "#1e293b", bubbleBorder: "#334155", bubbleFg: "white", textFg: "white",
      chipBg: "#0f172a", chipActiveBg: "#1e293b", chipBorder: "#334155", chipFg: "white",
    };
  }
  return {
    shellBg: "#0f172a", sideBg: "#0b1225", sideFg: "white", sideBorder: "#1e293b",
    mainBg: "white", mainFg: "#0f172a", barBg: "white", barFg: "#0f172a", barBorder: "#e5e7eb", chatBg: "#f8fafc",
    inputBg: "white", inputFg: "#0f172a", inputBorder: "#d1d5db",
    btnBg: "#111827", btnFg: "white", btnBorder: "#111827",
    bubbleUserBg: "#f9fafb", bubbleAssistantBg: "#e0e7ff", bubbleSystemBg: "#fef3c7", bubbleBorder: "#cbd5e1", bubbleFg: "#0f172a", textFg: "#111827",
    chipBg: "#0f172a", chipActiveBg: "#1e293b", chipBorder: "#334155", chipFg: "white",
  };
}
