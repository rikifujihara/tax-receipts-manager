import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  const email = data.email!;
  const google_user_id = data.id!;

  // Upsert user
  const res = await pool.query(
    `INSERT INTO users (google_user_id, email, refresh_token)
     VALUES ($1, $2, $3)
     ON CONFLICT (google_user_id) DO UPDATE
        SET refresh_token = EXCLUDED.refresh_token
     RETURNING id`,
    [google_user_id, email, tokens.refresh_token],
  );

  const user_id = res.rows[0].id;

  // Create session
  const session_id = crypto.randomUUID();
  await pool.query(`INSERT INTO sessions (id, user_id) VALUES ($1, $2)`, [
    session_id,
    user_id,
  ]);

  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set({
    name: process.env.SESSION_COOKIE_NAME!,
    value: session_id,
    httpOnly: true,
    path: "/",
  });
  return response;
}
