import { withErrorHandling } from "@/lib/helpers";
import { extractFields } from "@/lib/services/extract-fields";
import { ExtractedFieldsResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { fields } = await extractFields(req);
  return NextResponse.json({
    fields,
  } as ExtractedFieldsResponse);
});
