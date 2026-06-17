import express from 'express';
import { subscribe, publish } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/events/eventBus.js';

const app = express();
app.use(express.json());

subscribe('risk-engine','action.risk_check', async (data) => {
  console.log('RISK RECEIVED:', data);

  // simple risk score
  const riskScore = 10; // low risk

  await publish('action.approval_required', {
    ...data,
    riskScore
  });
});

app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

app.listen(3003, () => {
  console.log('risk-engine running on 3003');
});
