import express from 'express';
import { subscribe, publish } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/events/eventBus.js';
import { pool } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/db/index.js';

const app = express();
app.use(express.json());

subscribe('audit-service','action.executed', async (data) => {
  console.log('AUDIT RECEIVED:', data);

  await pool.query(
    'INSERT INTO audit_events (event_type, payload) VALUES ($1, $2)',
    ['action.executed', data]
  );

  await publish('action.logged', data);
});

app.get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(3006, () => {
  console.log('audit-service running on 3006');
});
