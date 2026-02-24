import { extractFields } from "@/lib/services/extract-fields";
import { ExtractedFieldsResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { fields } = await extractFields(req);
  return NextResponse.json({
    fields,
  } as ExtractedFieldsResponse);
}
