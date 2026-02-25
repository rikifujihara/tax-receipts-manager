import { AppError } from "@/lib/error";
import { withErrorHandling } from "@/lib/helpers";
import { extractFields } from "@/lib/services/extract-fields";
import { ExtractedFieldsResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  // Parse and validate fields
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const occupation = formData.get("occupation") as string;

  if (!file || !occupation) throw new AppError("Missing required fields", 400);

  const { fields } = await extractFields(file, occupation);

  return NextResponse.json({
    fields,
  } as ExtractedFieldsResponse);
});
