import express from "express";
import crypto from "crypto";

const app = express();
const port = process.env.PORT || 3000;
const registryBase = process.env.REGISTRY_URL || "http://127.0.0.1:4100";

app.use((req, res, next) => {
  const traceId = crypto.randomUUID();
  req.traceId = traceId;
  res.setHeader("x-trace-id", traceId);
  res.setHeader("x-powered-by", "bluedoor-gateway");
  console.log(`[GATEWAY] ${req.method} ${req.url} trace=${traceId}`);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gateway", ts: Date.now() });
});

async function resolveService(name) {
  const response = await fetch(`${registryBase}/services/${name}`);
  if (!response.ok) {
    throw new Error(`registry_lookup_failed:${name}`);
  }
  const payload = await response.json();
  return payload.service;
}

async function proxy(req, res, serviceName) {
  try {
    const svc = await resolveService(serviceName);
    const target = `${svc.baseUrl}${req.url}`;

    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        ...req.headers,
        "x-trace-id": req.traceId
      }
    });

    const body = await upstream.text();
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({
      ok: false,
      service: "gateway",
      route: serviceName,
      error: err instanceof Error ? err.message : "bad_gateway",
      traceId: req.traceId,
      ts: Date.now()
    });
  }
}

app.use("/v1/api", (req, res) => {
  proxy(req, res, "core-api");
});

app.use("/v1/auth", (req, res) => {
  proxy(req, res, "auth");
});

app.listen(port, () => {
  console.log("Gateway listening on", port);
});
