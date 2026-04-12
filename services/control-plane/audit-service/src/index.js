import express from 'express';

const app = express();
app.use(express.json());

app.post('/audit', async (req, res) => {
  const event = req.body;

  console.log('AUDIT EVENT:', event);

  res.json({ stored: true });
});

app.listen(3004, () => console.log('audit-service running'));
