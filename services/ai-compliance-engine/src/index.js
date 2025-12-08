import express from "express";

const app = express();
const port = process.env.PORT || 4104;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-compliance-engine", ts: Date.now() });
});

app.listen(port, () => {
  console.log(`ai-compliance-engine up on :${port}`);
});
