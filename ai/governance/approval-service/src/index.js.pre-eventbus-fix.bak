import express from 'express';
import { subscribe, publish } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/events/eventBus.js';

const app = express();
app.use(express.json());

subscribe('approval-service','action.approval_required', async (data) => {
  console.log('APPROVAL RECEIVED:', data);

  // auto-approve for now
  const approved = true;

  await publish('action.approved', {
    ...data,
    approved
  });
});

app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

app.listen(3004, () => {
  console.log('approval-service running on 3004');
});
