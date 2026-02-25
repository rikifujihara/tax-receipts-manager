import { NextRequest, NextResponse } from "next/server";
import { googleOAuthCallback } from "@/lib/services/auth";
import { withErrorHandling } from "@/lib/helpers";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });
  const sessionId = await googleOAuthCallback(code);
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set({
    name: process.env.SESSION_COOKIE_NAME!,
    value: sessionId,
    httpOnly: true,
    path: "/",
  });
  return response;
});
