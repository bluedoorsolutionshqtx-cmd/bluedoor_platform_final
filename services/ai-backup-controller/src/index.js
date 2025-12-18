import express from "express";

const app = express();
const port = process.env.PORT || 4105;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-backup-controller", ts: Date.now() });
});

app.listen(process.env.PORT, ) => {
  console.log(`ai-backup-controller up on :${port}`);
});
\nconsole.log('Service listening on', process.env.PORT);
