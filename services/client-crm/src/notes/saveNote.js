import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

export async function saveNote(
  entityType,
  entityId,
  note,
  createdBy = 'system'
) {
  const result =
    await pool.query(
      `
      INSERT INTO crm_notes
      (
        entity_type,
        entity_id,
        note,
        created_by
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
        entityType,
        entityId,
        note,
        createdBy
      ]
    );

  return result.rows[0];
}
