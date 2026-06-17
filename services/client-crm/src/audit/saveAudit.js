import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

export async function saveAudit(
  workflowId,
  eventType,
  payload
) {
  await pool.query(
    `
    INSERT INTO workflow_audit
    (
      workflow_id,
      event_type,
      payload
    )
    VALUES
    (
      $1,
      $2,
      $3
    )
    `,
    [
      workflowId,
      eventType,
      JSON.stringify(payload)
    ]
  );
}
