import express from "express";

const app = express();
const port = process.env.PORT || 4003;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "notify", ts: Date.now() });
});

app.listen(port, () => {
  console.log(`notify up on :${port}`);
});
