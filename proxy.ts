import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export default async function proxy(req: NextRequest) {
  // check for valid session
  const sessionId = req.cookies.get(process.env.SESSION_COOKIE_NAME!);

  if (!sessionId?.value) return handleUnauthenticated(req);

  const res = await pool.query(
    `SELECT sessions.id, users.refresh_token 
   FROM sessions 
   JOIN users ON users.id = sessions.user_id
   WHERE sessions.id = $1 AND sessions.expires_at > NOW()`,
    [sessionId.value],
  );

  if (!res.rows[0]) return handleUnauthenticated(req);

  const response = NextResponse.next();
  response.headers.set("x-refresh-token", res.rows[0].refresh_token);
  return response;
}

function handleUnauthenticated(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: [
    "/((?!login|api/auth/google|api/auth/callback/google|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)",
  ],
};
