import express from "express";

const app = express();
const port = process.env.PORT || 4104;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-compliance-engine", ts: Date.now() });
});

app.listen(process.env.PORT, ) => {
  console.log(`ai-compliance-engine up on :${port}`);
});
\nconsole.log('Service listening on', process.env.PORT);
