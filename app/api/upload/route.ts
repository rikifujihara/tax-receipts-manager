import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/services/file-upload";
import { withErrorHandling } from "@/lib/helpers";

export const POST = withErrorHandling(async (req: NextRequest) => {
  await uploadFile(req);

  return NextResponse.json({
    success: true,
  });
});
