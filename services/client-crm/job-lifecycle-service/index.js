import express from 'express';
import pg from 'pg';

import {
  subscribe
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(express.json());

const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

await db.query(`
CREATE TABLE IF NOT EXISTS job_lifecycle (
  id SERIAL PRIMARY KEY,
  job_id TEXT UNIQUE NOT NULL,
  client_id TEXT,
  property_id TEXT,
  current_stage TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
)
`);

console.log(
  '[job-lifecycle-service] postgres connected'
);

async function updateLifecycle(
  jobId,
  clientId,
  propertyId,
  stage
) {

  if (!jobId) {
    console.log(
      "[job-lifecycle-service] skipped",
      stage,
      "missing jobId"
    );
    return;
  }


  await db.query(
    `
    INSERT INTO job_lifecycle (
      job_id,
      client_id,
      property_id,
      current_stage,
      status,
      updated_at
    )
    VALUES (
      $1,$2,$3,$4,$5,NOW()
    )
    ON CONFLICT (job_id)
    DO UPDATE SET
      current_stage = EXCLUDED.current_stage,
      status = EXCLUDED.status,
      updated_at = NOW()
    `,
    [
      jobId,
      clientId ?? null,
      propertyId ?? null,
      stage,
      stage
    ]
  );

  console.log(
    '[job-lifecycle-service]',
    jobId,
    stage
  );
}

subscribe(
  'job-lifecycle-service',
  'job.created',
  async (data) => {
    await updateLifecycle(
      data.jobId,
      data.clientId,
      data.propertyId,
      'created'
    );
  }
);

subscribe(
  'job-lifecycle-service',
  'job.scheduled',
  async (data) => {
    await updateLifecycle(
      data.jobId,
      data.clientId,
      data.propertyId,
      'scheduled'
    );
  }
);

subscribe(
  'job-lifecycle-service',
  'route.planned',
  async (data) => {
    await updateLifecycle(
      data.jobId,
      data.clientId,
      data.propertyId,
      'routed'
    );
  }
);

subscribe(
  'job-lifecycle-service',
  'job.dispatched',
  async (data) => {
    await updateLifecycle(
      data.jobId,
      data.clientId,
      data.propertyId,
      'dispatched'
    );
  }
);

subscribe(
  'job-lifecycle-service',
  'job.completed',
  async (data) => {
    await updateLifecycle(
      data.jobId,
      data.clientId,
      data.propertyId,
      'completed'
    );
  }
);

subscribe(
  'job-lifecycle-service',
  'invoice.created',
  async (data) => {
    await updateLifecycle(
      data.jobId,
      data.clientId,
      data.propertyId,
      'invoiced'
    );
  }
);

subscribe(
  'job-lifecycle-service',
  'payment.received',
  async (data) => {
    await updateLifecycle(
      data.jobId,
      data.clientId,
      data.propertyId,
      'paid'
    );
  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      status: 'ok'
    });
  }
);

app.listen(
  4015,
  () => {
    console.log(
      'job-lifecycle-service running on 4015'
    );
  }
);
