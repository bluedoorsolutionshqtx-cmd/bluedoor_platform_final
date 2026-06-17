import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

export async function getAnalyticsSummary() {

  const leads =
    await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM crm_leads
      `
    );

  const clients =
    await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM crm_clients
      `
    );

  const properties =
    await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM crm_properties
      `
    );

  const tasks =
    await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM crm_tasks
      `
    );

  const notes =
    await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM crm_notes
      `
    );

  return {
    leads:
      Number(
        leads.rows[0].total
      ),
    clients:
      Number(
        clients.rows[0].total
      ),
    properties:
      Number(
        properties.rows[0].total
      ),
    tasks:
      Number(
        tasks.rows[0].total
      ),
    notes:
      Number(
        notes.rows[0].total
      )
  };
}
