import express from 'express';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(
  express.json()
);

subscribe(
  'execution-service',
  'action.execution_requested',
  async (data) => {

    console.log(
      'EXECUTION SERVICE RECEIVED:',
      data
    );

    const executionResult = {
      status: 'completed',
      executedAt:
        new Date().toISOString()
    };

    await publish(
      'action.executed',
      {
        ...data,
        executionResult
      }
    );

    await publish(
      'action.workflow_completion_requested',
      {
        workflowId:
          data.workflowId,
        eventId:
          data.eventId,
        type:
          data.type,
        executionResult
      }
    );

    console.log(
      'EXECUTION COMPLETED:',
      data.eventId
    );
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
  3015,
  () => {
    console.log(
      'execution-service running on 3015'
    );
  }
);
