import express from 'express';
import { subscribe, publish } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/events/eventBus.js';

const app = express();
app.use(express.json());

// simple contract schema (expand later)
function validateContract(data) {
  if (!data || typeof data !== 'object') return false;
  if (!data.ping && !data.job) return false;
  return true;
}

subscribe('contract-service','action.contract_check', async (data) => {
  console.log('CONTRACT RECEIVED:', data);

  const valid = validateContract(data);

  if (!valid) {
    console.log('CONTRACT REJECTED');
    return;
  }

  await publish('action.contract_validated', {
    ...data,
    contract: 'valid'
  });
});

app.get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(3008, () => {
  console.log('contract-service running on 3008');
});
