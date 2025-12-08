import express from "express";

const app = express();
const port = process.env.PORT || 4106;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-insights", ts: Date.now() });
});

app.listen(port, () => {
  console.log(`ai-insights up on :${port}`);
});
