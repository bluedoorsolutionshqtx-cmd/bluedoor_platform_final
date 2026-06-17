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
      '[replay-engine] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[replay-engine] postgres failed:',
      err.message
    );
  });

subscribe(
  'replay-engine',
  'action.replay_requested',
  async (data) => {

    const workflowId =
      data.workflowId;

    try {

      const state =
        await db.query(
          `
          SELECT *
          FROM workflow_state
          WHERE workflow_id = $1
          `,
          [workflowId]
        );

      const checkpoint =
        await db.query(
          `
          SELECT *
          FROM workflow_checkpoints
          WHERE workflow_id = $1
          `,
          [workflowId]
        );

      const audit =
        await db.query(
          `
          SELECT *
          FROM audit_events
          WHERE workflow_id = $1
          ORDER BY created_at ASC
          `,
          [workflowId]
        );

      const replayPayload = {
        workflowId,
        state:
          state.rows[0] || null,
        checkpoint:
          checkpoint.rows[0] || null,
        auditTrail:
          audit.rows
      };

      await db.query(
        `
        INSERT INTO workflow_replays (
          workflow_id,
          replay_payload
        )
        VALUES (
          $1,
          $2::jsonb
        )
        `,
        [
          workflowId,
          JSON.stringify(
            replayPayload
          )
        ]
      );

      await publish(
        'action.replayed',
        {
          workflowId,
          replayedAt:
            new Date()
              .toISOString(),
          replay:
            replayPayload
        }
      );

      console.log(
        '[replay-engine] replay completed',
        workflowId
      );

    } catch (err) {

      console.error(
        '[replay-engine] failed',
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
  3010,
  () => {
    console.log(
      'replay-engine running on 3010'
    );
  }
);
