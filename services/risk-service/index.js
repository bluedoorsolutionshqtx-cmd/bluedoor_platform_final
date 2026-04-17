import express from "express";

const app = express();
app.use(express.json());

app.post("/score", (req, res) => {
  const { event, payload } = req.body;

  let risk = 0;

  // 🔥 REAL LOGIC (expand later)
  if (event === "job.scheduled") {
    if (!payload.jobId) risk += 50;
    if (payload.priority === "high") risk += 30;
  }

  if (event === "invoice.issued") {
    if (payload.amount > 1000) risk += 40;
  }

  // clamp
  if (risk > 100) risk = 100;

  res.json({ risk });
});

app.listen(3005, () => console.log("risk-service running"));
