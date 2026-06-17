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

await db.query('SELECT NOW()');

console.log(
  '[operations-analytics-service] postgres connected'
);

async function recordOperation(
  jobId,
  routeId,
  crewId,
  status
) {

  if (!jobId) {
    return;
  }

  await db.query(
    `
    INSERT INTO operations_metrics (
      job_id,
      route_id,
      crew_id,
      status
    )
    VALUES (
      $1,
      $2,
      $3,
      $4
    )
    `,
    [
      jobId,
      routeId ?? null,
      crewId ?? null,
      status
    ]
  );

  console.log(
    '[operations]',
    status,
    jobId
  );
}

subscribe(
  'operations-analytics-service',
  'job.created',
  async (data) => {
    await recordOperation(
      data.jobId,
      null,
      null,
      'created'
    );
  }
);

subscribe(
  'operations-analytics-service',
  'job.scheduled',
  async (data) => {
    await recordOperation(
      data.jobId,
      null,
      null,
      'scheduled'
    );
  }
);

subscribe(
  'operations-analytics-service',
  'route.planned',
  async (data) => {
    await recordOperation(
      data.jobId,
      data.routeId,
      null,
      'planned'
    );
  }
);

subscribe(
  'operations-analytics-service',
  'job.dispatched',
  async (data) => {
    await recordOperation(
      data.jobId,
      data.routeId,
      data.crewId,
      'dispatched'
    );
  }
);

subscribe(
  'operations-analytics-service',
  'job.completed',
  async (data) => {
    await recordOperation(
      data.jobId,
      data.routeId,
      data.crewId,
      'completed'
    );
  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      service:
        'operations-analytics-service',
      status:
        'online'
    });
  }
);

app.listen(
  4016,
  () => {
    console.log(
      'operations-analytics-service running on 4016'
    );
  }
);
