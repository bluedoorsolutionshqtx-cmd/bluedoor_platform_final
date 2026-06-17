import express from 'express';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(
  express.json()
);

function buildAuditRecord(data) {

  return {
    eventId:
      data.eventId,
    workflowId:
      data.workflowId,
    action:
      'execution_completed',
    auditedAt:
      new Date()
        .toISOString()
  };
}

subscribe(
  'audit-engine',
  'action.audit_evaluation_requested',
  async (data) => {

    console.log(
      'AUDIT ENGINE RECEIVED:',
      data
    );

    const auditRecord =
      buildAuditRecord(
        data
      );

    await publish(
      'action.audit_logged',
      {
        ...data,
        auditRecord
      }
    );

    console.log(
      'AUDIT LOGGED:',
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
  3014,
  () => {
    console.log(
      'audit-engine running on 3014'
    );
  }
);
