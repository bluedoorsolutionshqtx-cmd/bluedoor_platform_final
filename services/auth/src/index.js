import express from "express";

const app = express();
const port = process.env.PORT || 4001;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "auth", ts: Date.now() });
});

app.listen(process.env.PORT, ) => {
  console.log(`auth up on :${port}`);
});
\nconsole.log('Service listening on', process.env.PORT);
