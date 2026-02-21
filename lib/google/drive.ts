import { SHEET_COLUMN_NAMES } from "@/lib/constants";
import { google, Auth, type drive_v3 } from "googleapis";

export async function getOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string,
) {
  const q = parentId
    ? `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`
    : `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const res = await drive.files.list({ q, fields: "files(id)" });

  if (res.data.files?.length) return res.data.files[0].id as string;

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId && { parents: [parentId] }),
    },
    fields: "id",
  });

  return folder.data.id as string;
}

export async function getOrCreateSheet(
  drive: drive_v3.Drive,
  oauth2Client: Auth.OAuth2Client,
  name: string,
  parentId: string,
) {
  const q = `name = '${name}' and mimeType = 'application/vnd.google-apps.spreadsheet' and '${parentId}' in parents and trashed = false`;

  const res = await drive.files.list({ q, fields: "files(id)" });

  if (res.data.files?.length) return res.data.files[0].id as string;

  const sheet = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.spreadsheet",
      ...(parentId && { parents: [parentId] }),
    },
    fields: "id",
  });

  // Add column names to sheet.
  const sheetId = sheet.data.id as string;

  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:A",
    valueInputOption: "RAW",
    requestBody: {
      values: [Object.keys(SHEET_COLUMN_NAMES)],
    },
  });

  return sheetId;
}
