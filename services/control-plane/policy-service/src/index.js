import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/policy', async (req, res) => {
  const action = req.body;

  console.log('POLICY RECEIVED');

  const decision = 'allow';

  console.log('DECISION:', decision);

  if (decision === 'allow') {
  await axios.post('http://localhost:3005/approve', {
    ...action,
    decision
  });
}

  res.json({ decision });
});

app.listen(3002, () => console.log('policy-service running'));
