import express from 'express';

import {
  subscribe,
  publish
} from '../../../../platform/shared/events/eventBus.js';

const app = express();

app.use(express.json());

subscribe(
  'ai-insights',
  'action.executed',
  async (data) => {

    const insight = {
      leadId:
        data.lead?.id ||
        null,

      score: 80,

      recommendation:
        'Contact within 24 hours',

      generatedAt:
        Date.now()
    };

    console.log(
      '[AI INSIGHT]',
      insight
    );

    await publish(
      'ai.insight.generated',
      insight
    );
  }
);

app.get(
  '/health',
  (_req, res) => {
    res.json({
      ok: true,
      service: 'ai-insights',
      ts: Date.now()
    });
  }
);

const port =
  process.env.PORT || 4106;

app.listen(port, () => {
  console.log(
    `ai-insights up on :${port}`
  );
});
