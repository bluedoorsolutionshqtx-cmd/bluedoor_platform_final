import express from 'express';
import { config } from './config.js';

const app = express();
app.use(express.json());

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: config.serviceName
  });
});

// ROOT
app.get('/', (req, res) => {
  res.send(`${config.serviceName} running`);
});

app.listen(config.port, () => {
  console.log(`${config.serviceName} running on port ${config.port}`);
});
