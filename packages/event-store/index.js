import { pool } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/db/index.js';

export async function logEvent(eventId, channel, payload) {
  await pool.query(
    `INSERT INTO event_log (event_id, channel, payload)
     VALUES ($1, $2, $3)`,
    [eventId, channel, payload]
  );
}

export async function markProcessed(eventId) {
  await pool.query(
    `UPDATE event_log
     SET status='processed', updated_at=NOW()
     WHERE event_id=$1`,
    [eventId]
  );
}

export async function markFailed(eventId, err) {
  await pool.query(
    `UPDATE event_log
     SET status='failed',
         attempts = attempts + 1,
         last_error=$2,
         updated_at=NOW()
     WHERE event_id=$1`,
    [eventId, String(err)]
  );
}

export async function getFailed(limit = 50) {
  const res = await pool.query(
    `SELECT * FROM event_log
     WHERE status='failed'
     ORDER BY updated_at ASC
     LIMIT $1`,
    [limit]
  );
  return res.rows;
}
