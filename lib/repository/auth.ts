import { pool } from "@/lib/db";
export async function upsertUser(
  google_user_id: string,
  email: string,
  refresh_token: string,
) {
  return await pool.query(
    `INSERT INTO users (google_user_id, email, refresh_token)
         VALUES ($1, $2, $3)
         ON CONFLICT (google_user_id) DO UPDATE
            SET refresh_token = EXCLUDED.refresh_token
         RETURNING id`,
    [google_user_id, email, refresh_token],
  );
}

export async function selectValidSession(user_id: string) {
  return await pool.query(
    "SELECT * FROM sessions WHERE user_id = $1 AND expires_at > NOW()",
    [user_id],
  );
}

export async function insertSession(
  session_id: string,
  user_id: string,
  expires_at: Date,
) {
  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [session_id, user_id, expires_at],
  );
}

export async function selectSessionAndRefreshToken(sessionId: string) {
  return await pool.query(
    `SELECT sessions.id, users.refresh_token 
   FROM sessions 
   JOIN users ON users.id = sessions.user_id
   WHERE sessions.id = $1 AND sessions.expires_at > NOW()`,
    [sessionId],
  );
}
