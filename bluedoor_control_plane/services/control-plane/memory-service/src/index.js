import express from 'express';
import { subscribe } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/events/eventBus.js';
import { pool } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/db/index.js';

const app = express();
app.use(express.json());

subscribe('memory-service','action.logged', async (data) => {
  console.log('MEMORY RECEIVED:', data);

  await pool.query(
    'INSERT INTO memory_store (data) VALUES ($1)',
    [data]
  );

  console.log('PERSISTED TO MEMORY');
});

app.get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(3007, () => {
  console.log('memory-service running on 3007');
});
