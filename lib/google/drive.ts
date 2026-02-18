import { type drive_v3 } from "googleapis";

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
