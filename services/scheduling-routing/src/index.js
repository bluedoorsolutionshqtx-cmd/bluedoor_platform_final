import express from "express";

const app = express();
const port = process.env.PORT || 4002;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "scheduling-routing", ts: Date.now() });
});

app.listen(process.env.PORT, ) => {
  console.log(`scheduling-routing up on :${port}`);
});
\nconsole.log('Service listening on', process.env.PORT);
