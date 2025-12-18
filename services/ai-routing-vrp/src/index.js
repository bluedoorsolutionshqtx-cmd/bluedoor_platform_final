import express from "express";

const app = express();
const port = process.env.PORT || 4102;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-routing-vrp", ts: Date.now() });
});

app.listen(process.env.PORT, ) => {
  console.log(`ai-routing-vrp up on :${port}`);
});
\nconsole.log('Service listening on', process.env.PORT);
