import { NextRequest } from "next/server";
import { googleOAuthCallback } from "@/lib/services/auth";

export async function GET(req: NextRequest) {
  return await googleOAuthCallback(req);
}
