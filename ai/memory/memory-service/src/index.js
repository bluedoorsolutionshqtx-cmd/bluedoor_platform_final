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
  'memory-service',
  'action.audit_logged',
  async (data) => {

    console.log(
      'MEMORY SERVICE RECEIVED:',
      data
    );

    await publish(
      'action.memory_evaluation_requested',
      data
    );

    console.log(
      'MEMORY EVALUATION REQUESTED:',
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
  3008,
  () => {
    console.log(
      'memory-service running on 3008'
    );
  }
);
