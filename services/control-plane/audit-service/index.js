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
    console.log('[audit-service] postgres connected');
  })
  .catch((err) => {
    console.error(
      '[audit-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'audit-service',
  'action.executed',
  async (data) => {

    console.log(
      '[audit-service] received',
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
          'action.executed',
          JSON.stringify(data)
        ]
      );

      console.log(
        '[audit-service] inserted',
        data.eventId
      );

      await publish(
        'action.audit_logged',
        {
          ...data,
          auditedAt:
            new Date().toISOString()
        }
      );

    } catch (err) {

      console.error(
        '[audit-service] insert failed',
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
  3005,
  () => {
    console.log(
      'audit-service running on 3005'
    );
  }
);
