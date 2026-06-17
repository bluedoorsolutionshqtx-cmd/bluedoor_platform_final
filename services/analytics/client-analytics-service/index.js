import express from 'express';
import pg from 'pg';

import {
  subscribe
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

await db.query(`
CREATE TABLE IF NOT EXISTS client_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  amount NUMERIC(12,2) DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT NOW()
)
`);

console.log(
  '[client-analytics-service] postgres connected'
);

async function recordMetric(
  clientId,
  metricType,
  amount = 0
) {

  if (!clientId) {
    return;
  }

  await db.query(
    `
    INSERT INTO client_metrics (
      client_id,
      metric_type,
      amount
    )
    VALUES (
      $1,
      $2,
      $3
    )
    `,
    [
      clientId,
      metricType,
      amount
    ]
  );

  console.log(
    '[client metric]',
    metricType,
    clientId
  );
}

subscribe(
  'client-analytics-service',
  'crm.client.created',
  async (data) => {

    await recordMetric(
      data.clientId || data.id,
      'client_created'
    );

  }
);

subscribe(
  'client-analytics-service',
  'job.created',
  async (data) => {

    await recordMetric(
      data.clientId,
      'job_created'
    );

  }
);

subscribe(
  'client-analytics-service',
  'job.completed',
  async (data) => {

    await recordMetric(
      data.clientId,
      'job_completed'
    );

  }
);

subscribe(
  'client-analytics-service',
  'invoice.created',
  async (data) => {

    await recordMetric(
      data.clientId,
      'invoice_created',
      data.amount || 0
    );

  }
);

subscribe(
  'client-analytics-service',
  'payment.received',
  async (data) => {

    await recordMetric(
      data.clientId,
      'payment_received',
      data.amount || 0
    );

  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      service:
        'client-analytics-service',
      status:
        'online'
    });
  }
);

app.get(
  '/clients/:clientId',
  async (req, res) => {

    const result =
      await db.query(
        `
        SELECT
          client_id,
          metric_type,
          amount,
          recorded_at
        FROM client_metrics
        WHERE client_id = $1
        ORDER BY recorded_at DESC
        `,
        [
          req.params.clientId
        ]
      );

    res.send(
      result.rows
    );
  }
);

app.listen(
  4017,
  () => {
    console.log(
      'client-analytics-service running on 4017'
    );
  }
);
