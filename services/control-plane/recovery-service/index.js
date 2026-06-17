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
      '[recovery-service] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[recovery-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'recovery-service',
  'action.recovery_requested',
  async (data) => {

    const workflowId =
      data.workflowId;

    try {

      const checkpoint =
        await db.query(
          `
          SELECT
            workflow_id,
            payload,
            created_at
          FROM workflow_checkpoints
          WHERE workflow_id = $1
          `,
          [workflowId]
        );

      if (
        checkpoint.rows.length === 0
      ) {

        console.log(
          '[recovery-service] checkpoint not found',
          workflowId
        );

        return;
      }

      await db.query(
        `
        INSERT INTO workflow_recoveries (
          workflow_id,
          recovery_reason
        )
        VALUES (
          $1,
          $2
        )
        `,
        [
          workflowId,
          data.reason ||
          'manual_recovery'
        ]
      );

      const payload =
        checkpoint.rows[0]
          .payload;

      await publish(
        'action.recovered',
        {
          workflowId,
          recoveredAt:
            new Date()
              .toISOString(),
          checkpoint:
            payload
        }
      );

      console.log(
        '[recovery-service] recovered',
        workflowId
      );

    } catch (err) {

      console.error(
        '[recovery-service] failed',
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
  3009,
  () => {
    console.log(
      'recovery-service running on 3009'
    );
  }
);
