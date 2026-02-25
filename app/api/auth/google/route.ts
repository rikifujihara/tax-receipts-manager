import { withErrorHandling } from "@/lib/helpers";
import { googleSigninRedirect } from "@/lib/services/auth";
import { NextResponse } from "next/server";

export const GET = withErrorHandling(async () => {
  const url = await googleSigninRedirect();
  return NextResponse.redirect(url);
});
