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
      '[orchestrator-service] postgres connected'
    );
  })
  .catch((err) => {
    console.error(
      '[orchestrator-service] postgres failed:',
      err.message
    );
  });

subscribe(
  'orchestrator-service',
  'action.executed',
  async (data) => {

    const workflowId =
      data.workflowId ||
      data.eventId;

    try {

      await db.query(
        `
        INSERT INTO workflow_state (
          workflow_id,
          workflow_type,
          current_state,
          last_event,
          version,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          1,
          NOW()
        )
        ON CONFLICT (workflow_id)
        DO UPDATE SET
          current_state = EXCLUDED.current_state,
          last_event = EXCLUDED.last_event,
          version = workflow_state.version + 1,
          updated_at = NOW()
        `,
        [
          workflowId,
          data.workflowType ??
            'unknown',
          'completed',
          'action.executed'
        ]
      );

      console.log(
        '[orchestrator-service] state updated',
        workflowId
      );

    } catch (err) {

      console.error(
        '[orchestrator-service] state failed',
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
  3007,
  () => {
    console.log(
      'orchestrator-service running on 3007'
    );
  }
);
