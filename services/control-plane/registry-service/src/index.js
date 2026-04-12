import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/action', async (req, res) => {
  const action = req.body;

  console.log('REGISTRY → RISK');

  await axios.post('http://localhost:3001/risk', action);

  res.json({ status: 'sent_to_risk' });
});

app.listen(3000, () => console.log('registry-service running'));
