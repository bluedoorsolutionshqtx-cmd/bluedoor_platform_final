import express from 'express';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(
  express.json()
);

function evaluatePolicy(data) {

  return {
    decision: 'approved',
    reason: 'policy_passed'
  };
}

subscribe(
  'policy-engine',
  'action.policy_evaluation_requested',
  async (data) => {

    console.log(
      'POLICY ENGINE RECEIVED:',
      data
    );

    const result =
      evaluatePolicy(data);

    if (
      result.decision ===
      'denied'
    ) {

      await publish(
        'action.policy_denied',
        {
          ...data,
          policyDecision:
            'denied',
          reason:
            result.reason
        }
      );

      return;
    }

    await publish(
      'action.policy_approved',
      {
        ...data,
        policyDecision:
          'approved',
        reason:
          result.reason
      }
    );

    await publish(
      'action.risk_check',
      {
        ...data,
        policyDecision:
          'approved',
        reason:
          result.reason
      }
    );

    console.log(
      'POLICY APPROVED:',
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
  3011,
  () => {
    console.log(
      'policy-engine running on 3011'
    );
  }
);
