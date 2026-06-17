import express from 'express';
import { subscribe, publish } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/events/eventBus.js';

const app = express();
app.use(express.json());

// basic rule engine
function evaluatePolicy(data) {
  if (data.riskScore && data.riskScore > 50) return 'deny';
  return 'allow';
}

subscribe('policy-service','policy-service','action.contract_validated', async (data) => {
  console.log('POLICY RECEIVED:', data);

  const decision = evaluatePolicy(data);

  if (decision === 'deny') {
    console.log('POLICY DENIED');
    return;
  }

  await publish('action.risk_check', {
    ...data,
    policy: decision
  });
});

app.get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(3002, () => {
  console.log('policy-service running on 3002');
});
