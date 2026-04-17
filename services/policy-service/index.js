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

app.post("/decide", async (req, res) => {
  const { event, payload, risk = 0 } = req.body;

  if (risk > 80) {
    return res.json({ decision: "deny" });
  }

  if (risk > 40) {
    await pool.query(
      "INSERT INTO approvals (event, payload, status) VALUES ($1,$2,'pending')",
      [event, payload]
    );

    return res.json({ decision: "approval_required" });
  }

  return res.json({ decision: "allow" });
});

app.listen(3002, () => console.log("policy (DB) running"));
