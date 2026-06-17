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
CREATE TABLE IF NOT EXISTS crew_metrics (
  id BIGSERIAL PRIMARY KEY,
  crew_id TEXT NOT NULL,
  job_id TEXT,
  metric_type TEXT NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
)
`);

console.log(
  '[crew-analytics-service] postgres connected'
);

async function recordMetric(
  crewId,
  jobId,
  metricType
) {

  if (!crewId) {
    return;
  }

  await db.query(
    `
    INSERT INTO crew_metrics (
      crew_id,
      job_id,
      metric_type
    )
    VALUES (
      $1,
      $2,
      $3
    )
    `,
    [
      crewId,
      jobId ?? null,
      metricType
    ]
  );

  console.log(
    '[crew metric]',
    metricType,
    crewId
  );
}

subscribe(
  'crew-analytics-service',
  'job.dispatched',
  async (data) => {

    await recordMetric(
      data.crewId,
      data.jobId,
      'job_dispatched'
    );

  }
);

subscribe(
  'crew-analytics-service',
  'job.started',
  async (data) => {

    await recordMetric(
      data.crewId,
      data.jobId,
      'job_started'
    );

  }
);

subscribe(
  'crew-analytics-service',
  'job.completed',
  async (data) => {

    await recordMetric(
      data.crewId,
      data.jobId,
      'job_completed'
    );

  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      service:
        'crew-analytics-service',
      status:
        'online'
    });
  }
);

app.get(
  '/crew/:crewId',
  async (req, res) => {

    const result =
      await db.query(
        `
        SELECT *
        FROM crew_metrics
        WHERE crew_id = $1
        ORDER BY recorded_at DESC
        `,
        [
          req.params.crewId
        ]
      );

    res.send(
      result.rows
    );
  }
);

app.listen(
  4018,
  () => {
    console.log(
      'crew-analytics-service running on 4018'
    );
  }
);
