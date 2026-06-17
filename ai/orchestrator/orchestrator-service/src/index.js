import express from 'express';
import crypto from 'crypto';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(
  express.json()
);

subscribe(
  'orchestrator-service',
  'crm.lead.created',
  async (lead) => {

    const workflowId =
      crypto.randomUUID();

    const eventId =
      crypto
        .createHash('sha256')
        .update(
          workflowId +
          Date.now()
        )
        .digest('hex');

    console.log(
      'ORCHESTRATOR RECEIVED:',
      lead.id
    );

    await publish(
      'action.registry_lookup_requested',
      {
        type:
          'lead_analysis',
        lead,
        eventId,
        workflowId,
        stage:
          'orchestrator'
      }
    );

    console.log(
      'WORKFLOW STARTED:',
      workflowId
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
  3010,
  () => {
    console.log(
      'orchestrator-service running on 3010'
    );
  }
);
