import express from 'express';

const app = express();

const services = [
  { name: 'registry', url: 'http://127.0.0.1:3001/health' },
  { name: 'policy', url: 'http://127.0.0.1:3002/health' },
  { name: 'risk', url: 'http://127.0.0.1:3003/health' },
  { name: 'approval', url: 'http://127.0.0.1:3004/health' },
  { name: 'execution', url: 'http://127.0.0.1:3005/health' },
  { name: 'audit', url: 'http://127.0.0.1:3006/health' },
  { name: 'memory', url: 'http://127.0.0.1:3007/health' },
  { name: 'contract', url: 'http://127.0.0.1:3008/health' }
];

app.get('/health', async (req, res) => {
  const results = [];

  for (const svc of services) {
    try {
      const r = await fetch(svc.url);
      const json = await r.json();
      results.push({ service: svc.name, status: json.status });
    } catch {
      results.push({ service: svc.name, status: 'DOWN' });
    }
  }

  res.json({
    system: 'bluedoor_control_plane',
    status: 'CHECK_COMPLETE',
    services: results
  });
});

app.listen(3010, () => console.log('monitoring-service running on 3010'));
