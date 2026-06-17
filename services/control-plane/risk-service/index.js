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
  'risk-service',
  'action.risk_check',
  async (data) => {

    console.log(
      'RISK SERVICE RECEIVED:',
      data
    );

    await publish(
      'action.risk_assessment_requested',
      data
    );

    console.log(
      'RISK FORWARDED:',
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
  3003,
  () => {
    console.log(
      'risk-service running on 3003'
    );
  }
);
