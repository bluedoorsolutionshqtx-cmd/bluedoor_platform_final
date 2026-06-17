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
      '[scheduling-service] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[scheduling-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'scheduling-service',
  'job.created',
  async (data) => {

    const jobId =
      data.jobId ||
      data.eventId;

    try {

      const scheduledDate =
        data.scheduledDate ||
        new Date()
          .toISOString()
          .split('T')[0];

      const scheduledTime =
        data.scheduledTime ||
        '08:00';

      await db.query(
        `
        INSERT INTO scheduled_jobs (
          job_id,
          client_id,
          property_id,
          scheduled_date,
          scheduled_time,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          'scheduled'
        )
        ON CONFLICT (job_id)
        DO NOTHING
        `,
        [
          jobId,
          data.clientId ?? null,
          data.propertyId ?? null,
          scheduledDate,
          scheduledTime
        ]
      );

      await publish(
        'job.scheduled',
        {
          ...data,
          jobId,
          scheduledDate,
          scheduledTime,
          status:'scheduled'
        }
      );

      console.log(
        '[scheduling-service] scheduled',
        jobId
      );

    } catch (err) {

      console.error(
        '[scheduling-service] failed',
        err
      );

    }
  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      status:'ok'
    });
  }
);

app.listen(
  3011,
  () => {
    console.log(
      'scheduling-service running on 3011'
    );
  }
);
