import express from 'express';

import {
  publish,
  subscribe
} from '../../../../platform/shared/events/eventBus.js';

const app = express();

app.use(express.json());

subscribe(
  'ai-orchestrator',
  'crm.lead.created',
  async (lead) => {

    console.log(
      '[AI ORCHESTRATOR] lead received',
      lead.id
    );

    await publish(
      'action.requested',
      {
        type: 'lead_analysis',
        lead
      }
    );
  }
);

app.get(
  '/health',
  (_req, res) => {
    res.json({
      ok: true,
      service: 'ai-orchestrator',
      ts: Date.now()
    });
  }
);

const port =
  process.env.PORT || 4101;

app.listen(port, () => {
  console.log(
    `ai-orchestrator up on :${port}`
  );
});
