import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

export async function saveTimelineEvent(
  entityType,
  entityId,
  eventType,
  payload
) {
  await pool.query(
    `
    INSERT INTO crm_activity_timeline
    (
      entity_type,
      entity_id,
      event_type,
      payload
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4
    )
    `,
    [
      entityType,
      entityId,
      eventType,
      JSON.stringify(payload)
    ]
  );
}
