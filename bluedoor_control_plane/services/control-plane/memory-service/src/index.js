import express from "express";
import { db } from "./lib/db.js";

const app = express();
app.use(express.json());

app.post("/store", async (req, res) => {
  const { action, outcome } = req.body;

  await db.query(
    "INSERT INTO agent_memory(action, outcome) VALUES($1, $2)",
    [action, outcome]
  );

  res.json({ stored: true });
});

app.listen(3000, () => console.log("memory-service running"));
