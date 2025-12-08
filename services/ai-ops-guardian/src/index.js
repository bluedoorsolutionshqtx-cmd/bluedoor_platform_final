import express from "express";

const app = express();
const port = process.env.PORT || 4103;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-ops-guardian", ts: Date.now() });
});

app.listen(port, () => {
  console.log(`ai-ops-guardian up on :${port}`);
});
