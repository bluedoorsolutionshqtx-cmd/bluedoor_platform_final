import express from "express";
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

app.post("/log", async (req, res) => {
  const { event, payload, decision, result } = req.body;

  await pool.query(
    "INSERT INTO audit_events (event, payload, decision, result) VALUES ($1,$2,$3,$4)",
    [event, payload || {}, decision || null, result || {}]
  );

  console.log("AUDIT STORED:", event);

  res.json({ ok: true });
});

app.listen(3003, () => console.log("audit (DB) running"));
