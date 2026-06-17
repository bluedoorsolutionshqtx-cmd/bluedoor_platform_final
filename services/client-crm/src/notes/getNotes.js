import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

export async function getNotes(
  entityType,
  entityId
) {
  const result =
    await pool.query(
      `
      SELECT *
      FROM crm_notes
      WHERE
        entity_type = $1
        AND
        entity_id = $2
      ORDER BY created_at DESC
      `,
      [
        entityType,
        entityId
      ]
    );

  return result.rows;
}
