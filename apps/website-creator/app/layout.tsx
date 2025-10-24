import "./globals.css";

export const metadata = {
  title: "Base44 — Civic Home Builder",
  description: "Claim your sovereign home; your agent helps you build it."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{fontFamily:"ui-sans-serif, system-ui, -apple-system"}}>
        <header style={{padding:"16px 20px", borderBottom:"1px solid #e5e7eb"}}>
          <a href="/" style={{textDecoration:"none", color:"#111"}}><strong>Base44</strong></a>
        </header>
        <main style={{maxWidth:980, margin:"0 auto", padding:"24px 16px"}}>{children}</main>
      </body>
    </html>
  );
}
