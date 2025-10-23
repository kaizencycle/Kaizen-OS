import "./styles.css";
import type { ReactNode } from "react";
import Logout from "@/components/Logout";
import AppSidebar from "@/components/AppSidebar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <AppSidebar />
          <main className="main">{children}</main>
        </div>
        <div className="topbar">
          <div className="grow" />
          <Logout />
        </div>
      </body>
    </html>
  );
}
