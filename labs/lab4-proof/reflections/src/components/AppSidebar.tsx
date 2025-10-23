"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SidebarStatus from "@/components/SidebarStatus";

const links = [
  { href: "/feed", label: "Feed", icon: "📰" },      // default landing
  { href: "/onboarding", label: "Onboarding", icon: "🧭" },
  { href: "/login", label: "Login", icon: "🔐" },
  { href: "/companion", label: "Companion", icon: "🤝" },
  { href: "/forest", label: "Forest", icon: "🌳" },
  { href: "/programs", label: "Programs", icon: "✨" },
  { href: "/consensus", label: "Consensus", icon: "🗳️" },
];

export default function AppSidebar() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(true);

  // remember state
  useEffect(() => {
    const s = localStorage.getItem("sidebar-open");
    if (s !== null) setOpen(s === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar-open", open ? "1" : "0");
  }, [open]);

  // keyboard: S toggles
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "s" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault(); setOpen(o=>!o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      <button className="sb-toggle" aria-label="Toggle sidebar" onClick={() => setOpen(o=>!o)}>
        ☰
      </button>
      <aside className={`sb ${open ? "open" : ""}`}>
        <div className="sb-head">
          <span className="logo">✨</span>
          <strong>Reflections</strong>
        </div>
        <nav className="sb-nav">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className={`sb-link ${active ? "active" : ""}`}>
                <span className="ic">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <SidebarStatus />
        <div className="sb-foot"><small>Press <kbd>S</kbd> to toggle</small></div>
      </aside>
    </>
  );
}
