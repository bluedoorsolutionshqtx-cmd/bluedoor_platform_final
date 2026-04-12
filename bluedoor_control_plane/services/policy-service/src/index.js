import express from "express";

const app = express();
app.use(express.json());

app.post("/evaluate", (req, res) => {
  const { riskScore } = req.body;

  if (riskScore > 80) return res.json({ decision: "deny" });
  if (riskScore > 50) return res.json({ decision: "approval_required" });

  return res.json({ decision: "allow" });
});

app.listen(3000, () => console.log("policy-service running"));
