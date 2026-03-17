import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use((req, _res, next) => {
  console.log(`[GATEWAY] ${req.method} ${req.url}`);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gateway", ts: Date.now() });
});

app.use("/v1/api", async (req, res) => {
  try {
    const target = `http://127.0.0.1:4000${req.url}`;
    const upstream = await fetch(target, {
      method: req.method,
      headers: req.headers,
    });
    const body = await upstream.text();
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({
      ok: false,
      service: "gateway",
      route: "core-api",
      error: err instanceof Error ? err.message : "bad_gateway",
      ts: Date.now(),
    });
  }
});

app.use("/v1/auth", async (req, res) => {
  try {
    const target = `http://127.0.0.1:4001${req.url}`;
    const upstream = await fetch(target, {
      method: req.method,
      headers: req.headers,
    });
    const body = await upstream.text();
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({
      ok: false,
      service: "gateway",
      route: "auth",
      error: err instanceof Error ? err.message : "bad_gateway",
      ts: Date.now(),
    });
  }
});

app.listen(port, () => {
  console.log("Gateway listening on", port);
});
