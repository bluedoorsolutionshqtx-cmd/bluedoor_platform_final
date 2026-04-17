import express from "express";
import { db } from "./lib/db.js";

const app = express();
app.use(express.json());

app.post("/request", async (req, res) => {
  const { action } = req.body;

  const result = await db.query(
    "INSERT INTO approvals(action, status) VALUES($1, $2) RETURNING *",
    [action, "pending"]
  );

  res.json(result.rows[0]);
});

app.listen(3000, () => console.log("approval-service running"));
