import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export default async function proxy(req: NextRequest) {
  // check for valid session
  const sessionId = req.cookies.get(process.env.SESSION_COOKIE_NAME!);

  if (!sessionId) return handleUnauthenticated(req);

  const res = await pool.query(
    "SELECT id FROM sessions WHERE id = $1 AND expires_at > NOW()",
    [sessionId],
  );

  if (!res.rows[0]) return handleUnauthenticated(req);

  return NextResponse.next();
}

function handleUnauthenticated(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", req.url));
}
