import express from 'express';

import {
  subscribe,
  publish
} from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/platform/shared/events/eventBus.js';

const app = express();

app.use(
  express.json()
);

function assessRisk(data) {

  let riskScore = 10;

  if (!data.lead?.email) {
    riskScore += 40;
  }

  if (!data.lead?.first_name) {
    riskScore += 25;
  }

  if (!data.lead?.last_name) {
    riskScore += 25;
  }

  let riskLevel = 'low';

  if (riskScore >= 75) {
    riskLevel = 'high';
  } else if (riskScore >= 40) {
    riskLevel = 'medium';
  }

  return {
    riskScore,
    riskLevel
  };
}

subscribe(
  'risk-engine',
  'action.risk_assessment_requested',
  async (data) => {

    console.log(
      'RISK ENGINE RECEIVED:',
      data
    );

    const result =
      assessRisk(data);

    await publish(
      'action.risk_assessed',
      {
        ...data,
        riskScore:
          result.riskScore,
        riskLevel:
          result.riskLevel
      }
    );

    console.log(
      'RISK ASSESSED:',
      result.riskScore,
      result.riskLevel
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
      'risk-engine running on 3003'
    );
  }
);
