import express from "express";

const app = express();
const port = process.env.PORT || 4103;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-ops-guardian", ts: Date.now() });
});

app.listen(process.env.PORT, ) => {
  console.log(`ai-ops-guardian up on :${port}`);
});
\nconsole.log('Service listening on', process.env.PORT);
