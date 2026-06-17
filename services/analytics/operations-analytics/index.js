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

db.query('SELECT NOW()')
  .then(() => {
    console.log(
      '[operations-analytics] postgres connected'
    );
  });

subscribe(
  'operations-analytics',
  'job.dispatched',
  async (data) => {

    try {

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
          data.jobId,
          data.routeId,
          data.crewId,
          'dispatched'
        ]
      );

      console.log(
        '[operations-analytics] recorded',
        data.jobId
      );

    } catch (err) {

      console.error(
        '[operations-analytics] failed',
        err
      );

    }

  }
);

app.get(
  '/health',
  (req,res) => {
    res.send({
      status:'ok'
    });
  }
);

app.listen(
  4013,
  () => {
    console.log(
      'operations-analytics running on 4013'
    );
  }
);
