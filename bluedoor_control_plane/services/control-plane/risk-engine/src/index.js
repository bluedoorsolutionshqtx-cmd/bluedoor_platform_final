import express from "express";

const app = express();
app.use(express.json());

app.post("/score", (req, res) => {
  const { action } = req.body;

  let score = 20;

  if (action?.type === "delete") score = 90;
  if (action?.type === "update") score = 60;

  res.json({ riskScore: score });
});

app.listen(3000, () => console.log("risk-engine running"));
