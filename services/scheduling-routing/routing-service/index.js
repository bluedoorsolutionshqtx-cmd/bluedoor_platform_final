import express from 'express';
import pg from 'pg';
import crypto from 'crypto';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(express.json());

const db = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5432/bluedoor'
});

db.query('SELECT NOW()')
  .then(() => {
    console.log(
      '[routing-service] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[routing-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'routing-service',
  'job.scheduled',
  async (data) => {

    const jobId =
      data.jobId;

    const routeId =
      crypto.randomUUID();

    try {

      await db.query(
        `
        INSERT INTO route_plans (
          job_id,
          route_id,
          status
        )
        VALUES (
          $1,
          $2,
          'planned'
        )
        ON CONFLICT (job_id)
        DO UPDATE SET
          route_id = EXCLUDED.route_id,
          status = EXCLUDED.status
        `,
        [
          jobId,
          routeId
        ]
      );

      await publish(
        'route.planned',
        {
          ...data,
          routeId,
          routeStatus:
            'planned',
          routedAt:
            new Date()
              .toISOString()
        }
      );

      console.log(
        '[routing-service] route planned',
        jobId,
        routeId
      );

    } catch (err) {

      console.error(
        '[routing-service] failed',
        err
      );

    }
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
  3012,
  () => {
    console.log(
      'routing-service running on 3012'
    );
  }
);
