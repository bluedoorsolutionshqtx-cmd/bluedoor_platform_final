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
    console.log('[memory-service] postgres connected');
  })
  .catch((err) => {
    console.error(
      '[memory-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'memory-service',
  'action.memory_stored',
  async (data) => {

    console.log(
      '[memory-service] received',
      data.eventId
    );

    try {

      await db.query(
        `
        INSERT INTO audit_events (
          event_id,
          workflow_id,
          workflow_type,
          event_type,
          payload
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5::jsonb
        )
        `,
        [
          data.eventId,
          data.workflowId ?? null,
          data.workflowType ?? null,
          'action.memory_stored',
          JSON.stringify(data)
        ]
      );

      console.log(
        '[memory-service] persisted',
        data.eventId
      );

      await publish(
        'action.audit_persisted',
        {
          eventId: data.eventId,
          workflowId:
            data.workflowId ?? null,
          persistedAt:
            new Date().toISOString()
        }
      );

    } catch (err) {

      console.error(
        '[memory-service] insert failed',
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
  3006,
  () => {
    console.log(
      'memory-service running on 3006'
    );
  }
);
