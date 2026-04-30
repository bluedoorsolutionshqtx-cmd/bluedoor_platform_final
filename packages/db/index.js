import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: 'postgresql://bluedoor:bluedoor@127.0.0.1:5432/bluedoor'
});
