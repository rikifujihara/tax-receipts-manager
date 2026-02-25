import { google } from "googleapis";
import { upsertUser } from "@/lib/repository/auth";
import { selectValidSession, insertSession } from "@/lib/repository/auth";

export async function googleOAuthCallback(code: string) {
  // Initialise oauth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  // Exchange code for tokens, authenticate our oauth client
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });

  // Get user's info from oauth
  const { data } = await oauth2.userinfo.get();
  const email = data.email!;
  const googleUserId = data.id!;

  // Upsert and return user from db
  const res = await upsertUser(googleUserId, email, tokens.refresh_token!);
  const userId = res.rows[0].id;

  // Find valid session or create a new one
  const sessionsRes = await selectValidSession(userId);
  const session = sessionsRes.rows[0];
  let sessionId = "";
  if (session) {
    sessionId = session.id;
  } else {
    sessionId = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await insertSession(sessionId, userId, expires_at);
  }

  return sessionId;
}

export async function googleSigninRedirect() {
  // Initialise oauth client
  const oauth2client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  // This is where the user will be directed to provide the app oauth access.
  // Scopes that the app needs are defined here (their google drive and basic info)
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

  return url;
}
