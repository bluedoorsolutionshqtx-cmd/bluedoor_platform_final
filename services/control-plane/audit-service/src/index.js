import express from "express";
import { db } from "./lib/db.js";

const app = express();
app.use(express.json());

app.post("/log", async (req, res) => {
  const { action, result } = req.body;

  await db.query(
    "INSERT INTO audit_logs(action, result) VALUES($1, $2)",
    [action, result]
  );

  res.json({ status: "logged" });
});

app.listen(3000, () => console.log("audit-service running"));
