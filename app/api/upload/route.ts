import { SHEET_NAME_PREFIX, TOP_LEVEL_FOLDER_NAME } from "@/lib/constants";
import { pool } from "@/lib/db";
import { getOrCreateFolder, getOrCreateSheet } from "@/lib/google/drive";
import { currentFinancialYear } from "@/lib/helpers";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

export async function POST(req: NextRequest) {
  // TODO: move session checking to proxy.ts
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
  const datePurchased = formData.get("datePurchased") as string;
  const supplierName = formData.get("supplierName") as string;
  const amount = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const expenseType = formData.get("expenseType") as string;
  const workRelatedPercentage = formData.get("workRelatedPercentage") as string;
  const workRelatedAmount = formData.get("workRelatedAmount") as string;
  const nexusToJob = formData.get("nexusToJob") as string;
  const dateRecordCreated = formData.get("dateRecordCreated") as string;

  const buffer = Buffer.from(await file.arrayBuffer());

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({ refresh_token: user.refresh_token });

  // Upload to Drive
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const l1 = await getOrCreateFolder(drive, TOP_LEVEL_FOLDER_NAME);
  const l2 = await getOrCreateFolder(drive, currentFinancialYear(), l1);

  const uploadedFile = await drive.files.create({
    requestBody: { name: file.name, parents: [l2] },
    media: { mimeType: file.type, body: Readable.from(buffer) },
    fields: "id, webViewLink",
  });

  const receiptUrl = uploadedFile.data.webViewLink;

  const sheetName = SHEET_NAME_PREFIX + currentFinancialYear();

  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  const sheetId = await getOrCreateSheet(drive, oauth2Client, sheetName, l2);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:A",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          datePurchased,
          supplierName,
          amount,
          description,
          expenseType,
          workRelatedPercentage,
          workRelatedAmount,
          nexusToJob,
          dateRecordCreated,
          receiptUrl,
        ],
      ],
    },
  });

  return NextResponse.json({
    success: true,
  });
}
