import express from "express";

const app = express();
app.use(express.json());

const SERVICES = {
  policy: process.env.POLICY_URL,
  risk: process.env.RISK_URL,
  approval: process.env.APPROVAL_URL,
  execution: process.env.EXECUTION_URL,
  audit: process.env.AUDIT_URL,
  memory: process.env.MEMORY_URL
};

app.post("/resolve", (req, res) => {
  const { action } = req.body;

  res.json({
    action,
    contract: "default-contract",
    services: SERVICES
  });
});

app.listen(3000, () => console.log("registry-service running"));
