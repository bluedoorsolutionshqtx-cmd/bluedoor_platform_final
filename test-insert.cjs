const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await pool.query(`
      INSERT INTO event_log
      (event_id, channel, payload, status, attempts, last_error)
      VALUES
      (
        gen_random_uuid()::text,
        'system',
        '{}'::jsonb,
        'failed',
        0,
        NULL
      )
    `);

    console.log('Insert OK');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
