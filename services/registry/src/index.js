import express from "express";

const app = express();
const port = process.env.PORT || 4100;

app.use(express.json());

const services = {
  gateway: { name: "gateway", baseUrl: "http://127.0.0.1:3000", health: "/health", version: "v1" },
  "core-api": { name: "core-api", baseUrl: "http://127.0.0.1:4000", health: "/health", version: "v1" },
  auth: { name: "auth", baseUrl: "http://127.0.0.1:4001", health: "/health", version: "v1" }
};

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "registry", ts: Date.now() });
});

app.get("/services", (_req, res) => {
  res.json({ ok: true, services, ts: Date.now() });
});

app.get("/services/:name", (req, res) => {
  const svc = services[req.params.name];
  if (!svc) {
    return res.status(404).json({ ok: false, error: "service_not_found", ts: Date.now() });
  }
  res.json({ ok: true, service: svc, ts: Date.now() });
});

app.post("/services", (req, res) => {
  const { name, baseUrl, health = "/health", version = "v1" } = req.body || {};
  if (!name || !baseUrl) {
    return res.status(400).json({ ok: false, error: "name_and_baseUrl_required", ts: Date.now() });
  }

  services[name] = { name, baseUrl, health, version };
  res.status(201).json({ ok: true, service: services[name], ts: Date.now() });
});

app.delete("/services/:name", (req, res) => {
  if (!services[req.params.name]) {
    return res.status(404).json({ ok: false, error: "service_not_found", ts: Date.now() });
  }

  delete services[req.params.name];
  res.json({ ok: true, deleted: req.params.name, ts: Date.now() });
});

app.listen(port, () => {
  console.log("Registry listening on", port);
});
