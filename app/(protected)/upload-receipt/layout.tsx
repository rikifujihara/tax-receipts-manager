import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Protected({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(process.env.SESSION_COOKIE_NAME!)?.value;

  if (!sessionId) redirect("./login");

  const sessionRes = await pool.query(
    "SELECT user_id FROM sessions WHERE id = $1",
    [sessionId],
  );

  if (!sessionRes.rows[0]) redirect("./login");

  const user_id = sessionRes.rows[0].user_id;

  // Get user details from DB
  const userRes = await pool.query(
    "SELECT refresh_token, spreadsheet_id FROM users WHERE id = $1",
    [user_id],
  );

  const user = userRes.rows[0];
  if (!user) redirect("login");
  return <>{children}</>;
}
