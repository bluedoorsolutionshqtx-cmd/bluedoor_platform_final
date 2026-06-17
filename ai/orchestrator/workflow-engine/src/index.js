import express from 'express';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

import pool from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/postgres/client.js';

const app = express();

app.use(express.json());

subscribe(
  'workflow-engine',
  'action.workflow_completion_requested',
  async (data) => {

    try {

      console.log(
        'WORKFLOW ENGINE RECEIVED:',
        JSON.stringify(data, null, 2)
      );

      await pool.query(
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
          data.workflowId,
          data.type || 'lead_analysis',
          'completed',
          'action.workflow_completed'
        ]
      );

      console.log(
        'WORKFLOW STATE SAVED:',
        data.workflowId
      );

      await publish(
        'action.workflow_completed',
        {
          ...data,
          workflowState: {
            workflowId:
              data.workflowId,
            state:
              'completed'
          }
        }
      );

    } catch (err) {

      console.error(
        'WORKFLOW ENGINE ERROR:',
        err.message
      );

    }

  }
);

app.listen(
  3016,
  () => {
    console.log(
      'workflow-engine running on 3016'
    );
  }
);
