"use client";
import { useEffect, useState } from "react";

export default function ChamberDrawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose?: () => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  // remember state per session
  useEffect(() => {
    const s = localStorage.getItem("drawer-open");
    if (s !== null) setOpen(s === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("drawer-open", open ? "1" : "0");
  }, [open]);
  // keyboard shortcut: D toggles drawer
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      <button
        aria-label="Toggle drawer"
        className="drawer-toggle"
        onClick={() => setOpen(o => !o)}
      >
        {open ? "⟨" : "⟩"}
      </button>

      <aside className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-head">
          <span className="dot" /> <strong>{title}</strong>
          <button className="close" onClick={() => { setOpen(false); onClose?.(); }}>✕</button>
        </div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-foot">
          <small>Tip: press <kbd>D</kbd> to toggle</small>
        </div>
      </aside>
    </>
  );
}
