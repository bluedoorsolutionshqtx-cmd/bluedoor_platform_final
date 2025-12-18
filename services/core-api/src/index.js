import express from "express";

const app = express();
const port = process.env.PORT || 4000;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "core-api", ts: Date.now() });
});

app.listen(process.env.PORT, ) => {
  console.log(`core-api up on :${port}`);
});
\nconsole.log('Service listening on', process.env.PORT);
