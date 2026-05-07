import express from "express";
import pkg from "pg";
import fetch from "node-fetch";

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bluedoor",
  port: 5432
});

const app = express();
app.use(express.json());

const EXECUTION = "http://localhost:3004";

// list pending approvals
app.get("/pending", async (_, res) => {
  const r = await pool.query(
    "SELECT * FROM approvals WHERE status='pending' ORDER BY id DESC"
  );
  res.json(r.rows);
});

// approve + trigger execution
app.post("/approve/:id", async (req, res) => {
  const id = req.params.id;

  const r = await pool.query(
    "SELECT * FROM approvals WHERE id=$1",
    [id]
  );

  if (!r.rows.length) {
    return res.status(404).json({ error: "not found" });
  }

  const row = r.rows[0];

  await pool.query(
    "UPDATE approvals SET status='approved' WHERE id=$1",
    [id]
  );

  await fetch(`${EXECUTION}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: row.event,
      payload: row.payload
    })
  });

  res.json({ approved: true });
});

// deny
app.post("/deny/:id", async (req, res) => {
  await pool.query(
    "UPDATE approvals SET status='denied' WHERE id=$1",
    [req.params.id]
  );

  res.json({ denied: true });
});

app.listen(3006, () => console.log("approval-service running"));
