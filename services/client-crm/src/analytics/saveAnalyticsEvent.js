import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

export async function saveAnalyticsEvent(
  eventType,
  entityType,
  entityId,
  payload
) {
  const result =
    await pool.query(
      `
      INSERT INTO crm_analytics_events
      (
        event_type,
        entity_type,
        entity_id,
        payload
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING *
      `,
      [
        eventType,
        entityType,
        entityId,
        JSON.stringify(payload)
      ]
    );

  return result.rows[0];
}
