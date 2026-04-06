import { dispatchAgent } from "../../ai/agents/dispatch-agent.js";
import { clientCommsAgent } from "../../ai/agents/client-comms-agent.js";
import express from "express";
import fetch from "node-fetch";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bluedoor",
  port: 5432
});

const app = express();
app.use(express.json());

const REGISTRY = "http://localhost:3001";
const POLICY = "http://localhost:3002";
const AUDIT = "http://localhost:3003";

app.post("/execute", async (req, res) => {
  const { event, payload } = req.body;

  const r = await fetch(`${REGISTRY}/resolve/${event}`);
  if (!r.ok) return res.json({ error: "no handler" });

  const { handler, action } = await r.json();

  const RISK = "http://localhost:3005";

const riskRes = await fetch(`${RISK}/score`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ event, payload })
});

const { risk } = await riskRes.json();

  const p = await fetch(`${POLICY}/decide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, payload, risk })
  });

  const decision = await p.json();

  if (decision.decision !== "allow") {
  await pool.query(
  "INSERT INTO executions (event, handler, action, status, payload) VALUES ($1,$2,$3,$4,$5)",
  [event, handler, action, success ? "executed" : "failed", payload]
);

await pool.query(
  "INSERT INTO agent_memory (key, value) VALUES ($1,$2)",
  [
    event,
    {
      payload,
      result,
      success,
      error: errorReason,
      ts: new Date().toISOString()
    }
  ]
);

  await fetch(`${AUDIT}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      payload,
      decision: decision.decision
    })
  });

  return res.json({ queued: true });
}

  let result;
  let success = true;
  let errorReason = null;

try {
  if (handler === "dispatch-agent") {
    result = await dispatchAgent(payload);
  }

  if (handler === "client-comms-agent") {
    result = await clientCommsAgent(payload);
  }

  if (!result) {
    result = { status: "no-handler-executed" };
  }

} catch (err) {
  success = false;
  errorReason = err.message;
}

if (!result) {
  result = { status: "no-handler-executed" };
}

  await pool.query(
    "INSERT INTO executions (event, handler, action, status, payload) VALUES ($1,$2,$3,$4,$5)",
    [event, handler, action, result.status, payload]
  );

  await fetch(`${AUDIT}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      payload,
      decision: "allow",
      result
    })
  });

  res.json(result);
});

app.listen(3004, () => console.log("execution (DB) running"));
