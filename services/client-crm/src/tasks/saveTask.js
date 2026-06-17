import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

export async function saveTask(
  entityType,
  entityId,
  title,
  description,
  dueDate,
  assignedTo
) {
  const result =
    await pool.query(
      `
      INSERT INTO crm_tasks
      (
        entity_type,
        entity_id,
        title,
        description,
        due_date,
        assigned_to
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING *
      `,
      [
        entityType,
        entityId,
        title,
        description,
        dueDate,
        assignedTo
      ]
    );

  return result.rows[0];
}
