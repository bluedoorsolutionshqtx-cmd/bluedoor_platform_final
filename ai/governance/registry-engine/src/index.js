import express from 'express';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(
  express.json()
);

function resolveWorkflow(data) {

  return {
    workflowType:
      'lead_analysis',
    nextAction:
      'action.contract_check'
  };
}

subscribe(
  'registry-engine',
  'action.registry_lookup_requested',
  async (data) => {

    console.log(
      'REGISTRY ENGINE RECEIVED:',
      data
    );

    const result =
      resolveWorkflow(data);

    await publish(
      'action.registry_resolved',
      {
        ...data,
        workflowType:
          result.workflowType
      }
    );

    await publish(
      result.nextAction,
      {
        ...data,
        workflowType:
          result.workflowType,
        stage:
          'registry'
      }
    );

    console.log(
      'REGISTRY RESOLVED:',
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
  3012,
  () => {
    console.log(
      'registry-engine running on 3012'
    );
  }
);
