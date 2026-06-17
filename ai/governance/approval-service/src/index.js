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
  'approval-service',
  'action.risk_assessed',
  async (data) => {

    console.log(
      'APPROVAL SERVICE RECEIVED:',
      data
    );

    await publish(
      'action.approval_evaluation_requested',
      data
    );

    console.log(
      'APPROVAL EVALUATION REQUESTED:',
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
  3004,
  () => {
    console.log(
      'approval-service running on 3004'
    );
  }
);
