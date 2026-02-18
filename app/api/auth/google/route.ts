import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
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
