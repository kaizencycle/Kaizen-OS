import Link from "next/link";
import { useRouter } from "next/router";

const LINKS = [
  { href: "/dev/context", label: "Context" },
  { href: "/dev/ledger",  label: "Ledger" },
  { href: "/dev/queue",   label: "Queue" },
  { href: "/dev/reports", label: "Reports" },
];

export default function DevNav(){
  const { pathname } = useRouter();
  return (
    <aside style={{
      width: 180, padding: 12,
      borderRight: "1px solid #1b2440",
      position: "sticky", top: 0, height: "100%"
    }}>
      <div style={{fontWeight:700, marginBottom: 8}}>Dev Tools</div>
      <nav style={{display:"grid", gap: 6}}>
        {LINKS.map(({href,label})=>{
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                textDecoration: "none",
                color: active ? "#0b1020" : "#cfe0ff",
                background: active ? "#9fd1ff" : "transparent",
                border: "1px solid #1b2440"
              }}>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}