import express from "express";
import crypto from "crypto";

const app = express();
const port = process.env.PORT || 3000;

/**
 * Request identity + trace
 */
app.use((req, res, next) => {
  const traceId = crypto.randomUUID();

  req.traceId = traceId;

  res.setHeader("x-trace-id", traceId);
  res.setHeader("x-powered-by", "bluedoor-gateway");

  console.log(`[GATEWAY] ${req.method} ${req.url} trace=${traceId}`);

  next();
});

/**
 * Health
 */
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "gateway",
    ts: Date.now(),
  });
});

/**
 * Proxy helper
 */
async function proxy(req, res, targetBase) {
  try {
    const target = `${targetBase}${req.url}`;

    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        ...req.headers,
        "x-trace-id": req.traceId,
      },
    });

    const body = await upstream.text();

    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({
      ok: false,
      service: "gateway",
      error: err instanceof Error ? err.message : "bad_gateway",
      traceId: req.traceId,
      ts: Date.now(),
    });
  }
}

/**
 * Versioned routes
 */
app.use("/v1/api", (req, res) => {
  proxy(req, res, "http://127.0.0.1:4000");
});

app.use("/v1/auth", (req, res) => {
  proxy(req, res, "http://127.0.0.1:4001");
});

app.listen(port, () => {
  console.log("Gateway listening on", port);
});
