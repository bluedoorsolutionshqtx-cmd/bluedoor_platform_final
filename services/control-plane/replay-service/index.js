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
      '[checkpoint-service] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[checkpoint-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'replay-service',
  'action.executed',
  async (data) => {

    const workflowId =
      data.workflowId ||
      data.eventId;

    try {

      await db.query(
        `
        INSERT INTO workflow_checkpoints (
          workflow_id,
          payload
        )
        VALUES (
          $1,
          $2::jsonb
        )
        ON CONFLICT (workflow_id)
        DO UPDATE SET
          payload = EXCLUDED.payload,
          created_at = NOW()
        `,
        [
          workflowId,
          JSON.stringify(data)
        ]
      );

      console.log(
        '[checkpoint-service] checkpoint saved',
        workflowId
      );

    } catch (err) {

      console.error(
        '[checkpoint-service] failed',
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
  3008,
  () => {
    console.log(
      'checkpoint-service running on 3008'
    );
  }
);
