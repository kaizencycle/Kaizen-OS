"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/hub", label: "OAA Hub" },
    { href: "/lesson", label: "Lesson" },
    { href: "/booklet", label: "Booklet" },
    { href: "/reflections", label: "Reflections" },
    { href: "/quality-dashboard", label: "Quality" },
    { href: "/docs", label: "Docs" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav style={wrap}>
        <div style={left}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>OAA Central</span>
        </div>
        <div style={right} className="hidden md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                ...linkStyle,
                borderBottom: path === href ? "2px solid white" : "2px solid transparent",
                opacity: path === href ? 1 : 0.7,
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <button
          onClick={toggleMobileMenu}
          style={hamburgerButton}
          className="md:hidden touch-target"
          aria-label="Toggle mobile menu"
        >
          <div style={hamburgerIcon(mobileMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay open"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div 
        className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}
        style={mobileSidebar}
      >
        <div style={mobileHeader}>
          <span style={{ fontWeight: 800, fontSize: 18 }}>OAA Central</span>
          <button
            onClick={toggleMobileMenu}
            style={closeButton}
            className="touch-target"
            aria-label="Close mobile menu"
          >
            ✕
          </button>
        </div>
        <div style={mobileLinks}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={toggleMobileMenu}
              style={{
                ...mobileLinkStyle,
                backgroundColor: path === href ? "rgba(255, 255, 255, 0.1)" : "transparent",
                borderLeft: path === href ? "3px solid white" : "3px solid transparent",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

const wrap: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 18px",
  background: "#0f172a",
  color: "white",
  borderBottom: "1px solid #1e293b",
  position: "relative",
  zIndex: 1001,
};

const left: React.CSSProperties = { 
  display: "flex", 
  gap: 12, 
  alignItems: "center" 
};

const right: React.CSSProperties = { 
  display: "flex", 
  gap: 16, 
  alignItems: "center" 
};

const linkStyle: React.CSSProperties = { 
  textDecoration: "none", 
  color: "white", 
  fontWeight: 500,
  padding: "8px 12px",
  borderRadius: "6px",
  transition: "all 0.2s ease",
};

const hamburgerButton: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const hamburgerIcon = (isOpen: boolean): React.CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  width: "20px",
  height: "16px",
});

const mobileSidebar: React.CSSProperties = {
  background: "#0f172a",
  color: "white",
  borderRight: "1px solid #1e293b",
  padding: "0",
  display: "flex",
  flexDirection: "column",
};

const mobileHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid #1e293b",
};

const closeButton: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontSize: "20px",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mobileLinks: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  padding: "16px 0",
};

const mobileLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "white",
  fontWeight: 500,
  padding: "16px 20px",
  display: "block",
  transition: "all 0.2s ease",
  borderLeft: "3px solid transparent",
};