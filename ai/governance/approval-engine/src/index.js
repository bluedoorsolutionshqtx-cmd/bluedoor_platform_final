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
  'approval-engine',
  'action.approval_requested',
  async (data) => {

    console.log(
      'APPROVAL ENGINE RECEIVED:',
      data
    );

    await publish(
      'action.approved',
      {
        ...data,
        approvalStatus:
          'approved'
      }
    );

    await publish(
      'action.execution_requested',
      {
        ...data,
        approvalStatus:
          'approved'
      }
    );

    console.log(
      'APPROVAL GRANTED:',
      data.eventId
    );
  }
);

app.get(
  '/health',
  (req, res) => {
    res.send({
      status:'ok'
    });
  }
);

app.listen(
  3014,
  () => {
    console.log(
      'approval-engine running on 3014'
    );
  }
);
