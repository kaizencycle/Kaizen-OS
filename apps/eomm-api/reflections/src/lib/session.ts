import { getIronSession, SessionOptions } from "iron-session";

export type UserSession = { handle?: string };

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "agora_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
  },
};

export async function getSession(req: Request, res?: Response) {
  return await getIronSession<UserSession>(req, res as any, sessionOptions);
}

