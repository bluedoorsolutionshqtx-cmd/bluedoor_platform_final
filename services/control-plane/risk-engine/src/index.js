import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/risk', async (req, res) => {
  const action = req.body;

  console.log('RISK RECEIVED');

  const riskScore = Math.random();

  await axios.post('http://localhost:3002/policy', {
    ...action,
    riskScore
  });

  res.json({ riskScore });
});

app.listen(3001, () => console.log('risk-engine running'));
