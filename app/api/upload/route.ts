import { pool } from "@/lib/db";
import { getOrCreateFolder } from "@/lib/google/drive";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

export async function POST(req: NextRequest) {
  const session_id = req.cookies.get(process.env.SESSION_COOKIE_NAME!)?.value;

  if (!session_id)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const sessionRes = await pool.query(
    "SELECT user_id FROM sessions WHERE id = $1",
    [session_id],
  );

  if (!sessionRes.rows[0])
    return NextResponse.json({ error: "Invalid session" });

  const user_id = sessionRes.rows[0].user_id;

  // Get user details from DB
  const userRes = await pool.query(
    "SELECT refresh_token, spreadsheet_id FROM users WHERE id = $1",
    [user_id],
  );
  const user = userRes.rows[0];

  // Parse file from FormData
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const buffer = Buffer.from(await file.arrayBuffer());

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({ refresh_token: user.refresh_token });

  // Upload to Drive
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const l1 = await getOrCreateFolder(drive, "easy-receipts");
  const l2 = await getOrCreateFolder(drive, "easy-receipts-FY2026", l1);

  await drive.files.create({
    requestBody: { name: file.name, parents: [l2] },
    media: { mimeType: file.type, body: Readable.from(buffer) },
  });

  return NextResponse.json({
    success: true,
  });
}
