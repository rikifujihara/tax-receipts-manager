import { toAppError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import imageCompression from "browser-image-compression";

export const currentFinancialYear = () => {
  const month = Number(
    new Date().toLocaleDateString("en-AU", {
      timeZone: "Australia/Sydney",
      month: "numeric",
    }),
  );
  const year = Number(
    new Date().toLocaleDateString("en-AU", {
      timeZone: "Australia/Sydney",
      year: "numeric",
    }),
  );
  return `FY${month >= 7 ? String(year + 1) : year}`;
};

// For wrapping routes with error catching
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async function (req: NextRequest) {
    try {
      return await handler(req);
    } catch (err) {
      const appErr = toAppError(err);
      NextResponse.json({ error: appErr.message }, { status: appErr.code });
    }
  };
}

export async function compressIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const compressed = await imageCompression(file, { maxSizeMB: 4, useWebWorker: true });
    return new File([compressed], file.name, { type: compressed.type });
  } catch {
    return file;
  }
}
