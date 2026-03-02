import {
  RECEIPT_FILES_FOLDER_NAME,
  SHEET_NAME_PREFIX,
  TOP_LEVEL_FOLDER_NAME,
} from "@/lib/constants";
import { getOrCreateFolder, getOrCreateSheet } from "@/lib/services/drive";
import { currentFinancialYear } from "@/lib/helpers";
import { Auth, drive_v3, google } from "googleapis";
import { Readable } from "stream";
import { ReceiptFormState } from "@/lib/types";
import { AppError } from "@/lib/error";

export async function saveRecord({
  refreshToken,
  formStateFields,
  file,
  workRelatedAmount,
}: {
  refreshToken: string;
  formStateFields: ReceiptFormState;
  file: File;
  workRelatedAmount: string;
}) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  // Initialise drive client and set up/find folders
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const topLevelFolderId = await getOrCreateFolder(
    drive,
    TOP_LEVEL_FOLDER_NAME,
  );

  const secondLevelFolderId = await getOrCreateFolder(
    drive,
    currentFinancialYear(),
    topLevelFolderId,
  );

  const receiptFilesFolderId = await getOrCreateFolder(
    drive,
    RECEIPT_FILES_FOLDER_NAME,
    secondLevelFolderId,
  );

  const { receiptUrl } = await uploadFile({
    file,
    drive,
    parentFolderId: receiptFilesFolderId,
  });

  await appendToSheet({
    drive,
    oauth2Client,
    parentFolderId: secondLevelFolderId,
    formStateFields,
    workRelatedAmount,
    receiptUrl,
  });
}

async function uploadFile({
  file,
  drive,
  parentFolderId,
}: {
  file: File;
  drive: drive_v3.Drive;
  parentFolderId: string;
}) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadedFile = await drive.files.create({
    requestBody: { name: file.name, parents: [parentFolderId] },
    media: { mimeType: file.type, body: Readable.from(buffer) },
    fields: "id, webViewLink",
  });

  const receiptUrl = uploadedFile.data.webViewLink;

  if (!receiptUrl) throw new AppError("File uploaded but no URL returned", 502);

  return { receiptUrl };
}

async function appendToSheet({
  drive,
  oauth2Client,
  parentFolderId,
  formStateFields,
  receiptUrl,
  workRelatedAmount,
}: {
  drive: drive_v3.Drive;
  oauth2Client: Auth.OAuth2Client;
  parentFolderId: string;
  formStateFields: ReceiptFormState;
  receiptUrl: string;
  workRelatedAmount: string;
}) {
  const sheetName = SHEET_NAME_PREFIX + currentFinancialYear();

  // Initialise sheets client
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const sheetId = await getOrCreateSheet(
    drive,
    oauth2Client,
    sheetName,
    parentFolderId,
  );

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:A",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [...Object.values(formStateFields), workRelatedAmount, receiptUrl],
      ],
    },
  });
}
