import express from 'express';

const app = express();
app.use(express.json());

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'risk-engine'
  });
});

// ROOT
app.get('/', (req, res) => {
  res.send('Risk Engine Running');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Risk Engine running on port ${PORT}`);
});
