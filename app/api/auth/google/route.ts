import { googleSigninRedirect } from "@/lib/services/auth";

export async function GET() {
  return await googleSigninRedirect();
}
