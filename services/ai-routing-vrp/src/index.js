import express from "express";

const app = express();
const port = process.env.PORT || 4102;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-routing-vrp", ts: Date.now() });
});

app.listen(port, () => {
  console.log(`ai-routing-vrp up on :${port}`);
});
