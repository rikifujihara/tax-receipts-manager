import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/services/file-upload";

export async function POST(req: NextRequest) {
  await uploadFile(req);

  return NextResponse.json({
    success: true,
  });
}
