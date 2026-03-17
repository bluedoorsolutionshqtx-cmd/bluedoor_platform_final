import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/health", async (_req, res) => {
  res.json({ ok: true, service: "gateway", ts: Date.now() });
});

app.use("/api", async (req, res) => {
  const target = `http://127.0.0.1:4000${req.url}`;
  const upstream = await fetch(target, {
    method: req.method,
    headers: req.headers,
  });
  const text = await upstream.text();
  res.status(upstream.status).send(text);
});

app.use("/auth", async (req, res) => {
  const target = `http://127.0.0.1:4001${req.url}`;
  const upstream = await fetch(target, {
    method: req.method,
    headers: req.headers,
  });
  const text = await upstream.text();
  res.status(upstream.status).send(text);
});

app.listen(port, () => {
  console.log("Gateway listening on", port);
});
