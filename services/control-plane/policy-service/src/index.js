const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'policy-service' });
});

// basic endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Policy Service Running' });
});

app.listen(PORT, () => {
  console.log(`Policy Service running on port ${PORT}`);
});
