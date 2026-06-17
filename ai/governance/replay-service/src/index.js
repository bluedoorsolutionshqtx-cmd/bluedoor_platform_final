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
  'replay-service',
  'action.memory_stored',
  async (data) => {

    console.log(
      'REPLAY SERVICE RECEIVED:',
      data
    );

    await publish(
      'action.workflow_completion_requested',
      {
        ...data,
        replayReady: true
      }
    );

    console.log(
      'WORKFLOW COMPLETION REQUESTED:',
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
  3009,
  () => {
    console.log(
      'replay-service running on 3009'
    );
  }
);
