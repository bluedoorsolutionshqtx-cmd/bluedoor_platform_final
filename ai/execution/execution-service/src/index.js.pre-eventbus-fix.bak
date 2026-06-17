import express from 'express';
import { subscribe, publish } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/events/eventBus.js';
import { pool } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/db/index.js';

const app = express();
app.use(express.json());

subscribe('execution-service','action.approved', async (data) => {
  console.log('EXECUTION RECEIVED:', data);

  const result = { success: true, executedAt: Date.now() };

  await pool.query(
    'INSERT INTO executions (result) VALUES ($1)',
    [result]
  );

  await publish('action.executed', {
    ...data,
    result
  });
});

app.get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(3005, () => {
  console.log('execution-service running on 3005');
});
