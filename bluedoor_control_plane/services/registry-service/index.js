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

app.get("/resolve/:event", async (req, res) => {
  const result = await pool.query(
    "SELECT handler, action FROM registry WHERE event=$1",
    [req.params.event]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "no handler" });
  }

  res.json(result.rows[0]);
});

app.listen(3001, () => console.log("registry (DB) running"));
