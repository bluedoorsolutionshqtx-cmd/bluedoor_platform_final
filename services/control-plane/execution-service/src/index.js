import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/execute', async (req, res) => {
  const action = req.body;

  console.log('EXECUTING:', action.type);

  await axios.post('http://localhost:3004/audit', {
    ...action,
    result: 'success'
  });

  res.json({ status: 'executed' });
});

app.listen(3003, () => console.log('execution-service running'));
