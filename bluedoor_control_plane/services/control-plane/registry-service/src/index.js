import express from 'express';
import { subscribe, publish } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/events/eventBus.js';

const app = express();
app.use(express.json());

subscribe('registry-service','action.requested', async (data) => {
  console.log('REGISTRY RECEIVED:', data);

  await publish('action.contract_check', {
    ...data,
    stage: 'registry'
  });
});

app.get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(3001, () => {
  console.log('registry-service running on 3001');
});
