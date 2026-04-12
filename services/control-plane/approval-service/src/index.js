import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

let pending = [];

// Receive from policy
app.post('/approve', async (req, res) => {
  const action = req.body;

  const id = Date.now().toString();

  pending.push({ id, action });

  console.log('PENDING APPROVAL:', id, action.type);

  res.json({ status: 'pending', id });
});

// Manual approval
app.post('/approve/:id', async (req, res) => {
  const { id } = req.params;

  const item = pending.find(p => p.id === id);

  if (!item) {
    return res.status(404).json({ error: 'not found' });
  }

  console.log('APPROVED:', id);

  await axios.post('http://localhost:3003/execute', {
    ...item.action,
    approved: true
  });

  pending = pending.filter(p => p.id !== id);

  res.json({ approved: true });
});

// List pending
app.get('/pending', (req, res) => {
  res.json(pending);
});

app.listen(3005, () => console.log('approval-service running'));
