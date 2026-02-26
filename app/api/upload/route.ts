import { NextRequest, NextResponse } from "next/server";
import { saveRecord } from "@/lib/services/save-record";
import { withErrorHandling } from "@/lib/helpers";
import { FORM_STATE_FIELDS } from "@/lib/constants";
import { AppError } from "@/lib/error";
import { ReceiptFormState } from "@/lib/types";
import { headers } from "next/headers";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const refreshToken = (await headers()).get("x-refresh-token");
  if (!refreshToken) throw new AppError("Unauthorised", 401);

  // Parse file and form fields from FormData
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const workRelatedAmount = formData.get("workRelatedAmount") as string;
  if (!file || !workRelatedAmount)
    throw new AppError("Missing required fields", 400);

  const formStateFields = Object.fromEntries(
    (Object.keys(FORM_STATE_FIELDS) as (keyof ReceiptFormState)[]).map(
      (key) => {
        const data = formData.get(key);
        // Make sure each field is present on the form
        if (data === null) throw new AppError("Missing required fields", 400);
        return [key, data as string];
      },
    ),
  ) as ReceiptFormState;

  await saveRecord({ refreshToken, formStateFields, file, workRelatedAmount });

  return NextResponse.json({
    success: true,
  });
});
