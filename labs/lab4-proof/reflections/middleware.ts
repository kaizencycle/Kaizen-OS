import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./src/lib/session";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  const authed = Boolean(session.handle);

  const url = new URL(req.url);
  const isProtected = url.pathname.startsWith("/companion");

  if (isProtected && !authed) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", url.pathname);
    return NextResponse.redirect(login);
  }

  return res;
}

export const config = {
  matcher: ["/companion/:path*"],
};
