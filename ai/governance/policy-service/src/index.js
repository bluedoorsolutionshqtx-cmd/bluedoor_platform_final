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
  'policy-service',
  'action.contract_validated',
  async (data) => {

    console.log(
      'POLICY SERVICE RECEIVED:',
      data
    );

    await publish(
      'action.policy_evaluation_requested',
      data
    );

    console.log(
      'POLICY FORWARDED:',
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
  3002,
  () => {
    console.log(
      'policy-service running on 3002'
    );
  }
);
