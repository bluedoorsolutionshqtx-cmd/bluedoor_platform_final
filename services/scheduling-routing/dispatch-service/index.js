import express from 'express';
import pg from 'pg';

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
      '[dispatch-service] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[dispatch-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'dispatch-service',
  'route.planned',
  async (data) => {

    const jobId =
      data.jobId;

    const routeId =
      data.routeId;

    const crewId =
      data.crewId ||
      'CREW-001';

    try {

      await db.query(
        `
        INSERT INTO dispatch_jobs (
          job_id,
          route_id,
          crew_id,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          'dispatched'
        )
        ON CONFLICT (job_id)
        DO UPDATE SET
          route_id = EXCLUDED.route_id,
          crew_id = EXCLUDED.crew_id,
          status = EXCLUDED.status,
          dispatched_at = NOW()
        `,
        [
          jobId,
          routeId,
          crewId
        ]
      );

      await publish(
        'crew.dispatched',
        {
          ...data,
          crewId,
          dispatchStatus:
            'dispatched',
          dispatchedAt:
            new Date()
              .toISOString()
        }
      );

      console.log(
        '[dispatch-service] dispatched',
        jobId,
        crewId
      );

    } catch (err) {

      console.error(
        '[dispatch-service] failed',
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
  3013,
  () => {
    console.log(
      'dispatch-service running on 3013'
    );
  }
);
