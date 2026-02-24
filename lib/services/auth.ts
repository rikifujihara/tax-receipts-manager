import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { upsertUser } from "@/lib/repository/auth";
import { selectValidSession, insertSession } from "@/lib/repository/auth";

export async function googleOAuthCallback(req: NextRequest) {
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

  const res = await upsertUser(google_user_id, email, tokens.refresh_token!);

  const user_id = res.rows[0].id;

  // Check for valid session
  const sessionsRes = await selectValidSession(user_id);

  const session = sessionsRes.rows[0];

  let session_id = "";

  if (session) {
    session_id = session.id;
  } else {
    // Create session
    const session_id = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await insertSession(session_id, user_id, expires_at);
  }

  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set({
    name: process.env.SESSION_COOKIE_NAME!,
    value: session_id,
    httpOnly: true,
    path: "/",
  });
  return response;
}

export async function googleSigninRedirect() {
  const oauth2client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  const url = oauth2client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/drive.file",
    ],
    prompt: "consent",
  });

  return NextResponse.redirect(url);
}
