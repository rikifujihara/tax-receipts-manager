import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

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

  // Create session
  const session_id = crypto.randomUUID();
  const response = NextResponse.redirect("/");
  response.cookies.set({
    name: process.env.SESSION_COOKIE_NAME!,
    value: session_id,
    httpOnly: true,
    path: "/",
  });
  return response;
}
